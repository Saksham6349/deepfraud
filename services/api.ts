import { AnalysisResult, User, RiskLevel, DashboardStat } from "../types";
import { auth, db, googleProvider } from "./firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { collection, addDoc, getDocs, query, orderBy, limit, deleteDoc, getDocsFromCache } from "firebase/firestore";

const DB_KEY = 'deepfraud_db_v1';
const AUTH_KEY = 'deepfraud_session';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- LOCAL STORAGE FALLBACKS ---
const getLocalDb = (): AnalysisResult[] => {
  const str = localStorage.getItem(DB_KEY);
  return str ? JSON.parse(str) : [];
};

const saveLocalDb = (data: AnalysisResult[]) => {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
};

const mapFirebaseUser = (fbUser: FirebaseUser): User => {
    return {
        id: fbUser.uid,
        username: fbUser.email?.split('@')[0] || 'Operator',
        role: 'Analyst',
        clearanceLevel: 3,
        token: fbUser.uid // In a real app, you'd get the ID token
    };
};

export const api = {
  auth: {
    login: async (identifier: string, secret: string): Promise<User> => {
      // 1. Try Firebase Auth
      try {
        if (auth && identifier.includes('@')) {
            const userCredential = await signInWithEmailAndPassword(auth, identifier, secret);
            const user = mapFirebaseUser(userCredential.user);
            localStorage.setItem(AUTH_KEY, JSON.stringify(user));
            return user;
        }
      } catch (e: any) {
         // Fall through to local check if not a firebase error or if firebase is misconfigured
         if (e.code && e.code.startsWith('auth/')) {
             throw new Error(e.message);
         }
         console.warn("Firebase auth failed, checking local credentials", e);
      }

      // 2. Fallback Mock Auth
      if (identifier.toLowerCase() === 'admin' && secret === 'password') {
        await delay(1000);
        const user: User = {
          id: 'u_local_88',
          username: 'Admin_Local',
          role: 'System Admin',
          clearanceLevel: 5,
          token: 'mock_sess_' + Date.now()
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        return user;
      }
      
      throw new Error("Invalid credentials");
    },

    register: async (identifier: string, secret: string): Promise<User> => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, identifier, secret);
            const user = mapFirebaseUser(userCredential.user);
            localStorage.setItem(AUTH_KEY, JSON.stringify(user));
            return user;
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                throw new Error("This email is already registered. Please sign in instead.");
            }
            throw new Error(error.message);
        }
    },
    
    loginWithGoogle: async (): Promise<User> => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = mapFirebaseUser(result.user);
            localStorage.setItem(AUTH_KEY, JSON.stringify(user));
            return user;
        } catch (error: any) {
            throw new Error(error.message);
        }
    },

    recoverSession: async (): Promise<User | null> => {
        // Firebase automatically handles session persistence.
        // We wrap onAuthStateChanged in a promise to get the initial state.
        return new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                unsubscribe();
                if (user) {
                    const mapped = mapFirebaseUser(user);
                    localStorage.setItem(AUTH_KEY, JSON.stringify(mapped));
                    resolve(mapped);
                } else {
                    resolve(null);
                }
            });
        });
    },

    logout: async () => {
      try {
        await signOut(auth);
      } catch (e) { console.error(e); }
      localStorage.removeItem(AUTH_KEY);
    },

    getSession: (): User | null => {
      const str = localStorage.getItem(AUTH_KEY);
      return str ? JSON.parse(str) : null;
    }
  },

  records: {
    list: async (): Promise<AnalysisResult[]> => {
      // 1. Try Firebase Firestore
      try {
        const q = query(collection(db, "analysis_logs"), orderBy("timestamp", "desc"), limit(100));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    score: data.score,
                    verdict: data.verdict,
                    riskLevel: data.riskLevel,
                    reasoning: data.reasoning,
                    indicators: data.indicators,
                    timestamp: data.timestamp,
                    mediaType: data.mediaType,
                    fileName: data.fileName,
                    liveness: data.liveness
                };
            });
        }
      } catch (e) {
          console.warn("Firestore fetch error (likely missing config or permissions):", e);
      }

      // 2. Fallback Local Data
      return getLocalDb();
    },

    create: async (record: AnalysisResult): Promise<void> => {
      // 1. Try Firebase Insert
      try {
        await addDoc(collection(db, "analysis_logs"), {
            score: record.score,
            verdict: record.verdict,
            riskLevel: record.riskLevel,
            reasoning: record.reasoning,
            indicators: record.indicators,
            mediaType: record.mediaType,
            fileName: record.fileName,
            liveness: record.liveness,
            timestamp: record.timestamp // Use client timestamp or serverTimestamp()
        });
        return;
      } catch (e) {
        console.warn("Firestore insert failed:", e);
      }

      // 2. Fallback Local Insert
      const dbLocal = getLocalDb();
      const newRecord = { ...record, id: `case_${Date.now()}` };
      dbLocal.unshift(newRecord);
      if (dbLocal.length > 100) dbLocal.pop();
      saveLocalDb(dbLocal);
    },

    clear: async (): Promise<void> => {
       // Clearing collection in client SDK is not efficient (requires reading then deleting).
       // We'll just clear local for this demo.
       localStorage.removeItem(DB_KEY);
    }
  },

  stats: {
    getSummary: async (): Promise<DashboardStat[]> => {
      let data: AnalysisResult[] = [];
      try {
          data = await api.records.list();
      } catch (e) {
          data = getLocalDb();
      }

      const total = data.length;
      const threats = data.filter(i => i.score > 70).length;
      const blocked = data.filter(i => i.verdict === 'FAKE').length;
      const avgScore = total > 0 ? Math.round(data.reduce((acc, curr) => acc + curr.score, 0) / total) : 0;
      
      return [
        { label: 'Total Verifications', value: total, change: 0, trend: 'up' },
        { label: 'High Risk Alerts', value: threats, change: 0, trend: threats > 0 ? 'up' : 'neutral' },
        { label: 'Avg Risk Score', value: `${avgScore}%`, change: 0, trend: 'neutral' },
        { label: 'Fraud Blocked', value: blocked, change: 0, trend: 'up' },
      ];
    }
  }
};