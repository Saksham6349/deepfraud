import { AnalysisResult, User, RiskLevel, DashboardStat } from "../types";
import { supabase } from "./supabaseClient";

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

export const api = {
  auth: {
    login: async (identifier: string, secret: string): Promise<User> => {
      let supabaseError = null;

      // 1. Try Supabase Auth
      if (supabase) {
        // Only attempt Supabase auth if the identifier looks like an email
        if (identifier.includes('@')) {
            try {
                // Fix: Cast auth to any to handle version discrepancies (v1 vs v2)
                const authClient = supabase.auth as any;
                let response: any;
                
                if (typeof authClient.signInWithPassword === 'function') {
                   response = await authClient.signInWithPassword({
                      email: identifier,
                      password: secret,
                   });
                } else {
                   // Fallback to v1 signIn
                   response = await authClient.signIn({
                      email: identifier,
                      password: secret,
                   });
                   // Normalize v1 response to v2 structure for simpler handling below
                   if (!response.data && (response.user || response.session)) {
                       response = {
                           data: { user: response.user, session: response.session },
                           error: response.error
                       };
                   }
                }
    
                const { data, error } = response;
    
                if (error) {
                    // Capture the error to throw later if fallback fails/isn't applicable
                    supabaseError = error.message;
                } else if (data?.user) {
                    const user: User = {
                        id: data.user.id,
                        username: data.user.email?.split('@')[0] || 'Operator',
                        role: 'Analyst', // In a real app, fetch from a profiles table
                        clearanceLevel: 3,
                        token: data.session?.access_token
                    };
                    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
                    return user;
                }
            } catch (e) {
                console.warn("Supabase connection error:", e);
            }
        }
      }

      // 2. Fallback Mock Auth
      // Only check fallback if the input matches the specific demo credentials
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
      
      // If we attempted Supabase auth and got a specific error, throw that.
      if (supabaseError) {
          throw new Error(supabaseError);
      }
      
      throw new Error("Invalid credentials");
    },

    register: async (identifier: string, secret: string): Promise<User> => {
        if (!supabase) {
            throw new Error("Supabase is not configured. Cannot register new users.");
        }

        if (!identifier.includes('@')) {
            throw new Error("Please enter a valid email address.");
        }

        const authClient = supabase.auth as any;

        const { data, error } = await authClient.signUp({
            email: identifier,
            password: secret,
        });

        if (error) {
            // Provide a clearer message if the user already exists
            if (error.message.includes("User already registered") || error.message.includes("already registered")) {
                throw new Error("This email is already registered. Please sign in instead.");
            }
            throw new Error(error.message);
        }

        // Check if session exists (it might not if email confirmation is enabled)
        if (data.user && !data.session) {
            throw new Error("Registration successful! Please check your email to confirm your account before logging in.");
        }

        if (data.user && data.session) {
            const user: User = {
                id: data.user.id,
                username: data.user.email?.split('@')[0] || 'New User',
                role: 'Analyst',
                clearanceLevel: 1,
                token: data.session.access_token
            };
            localStorage.setItem(AUTH_KEY, JSON.stringify(user));
            return user;
        }
        
        throw new Error("Registration failed. Please try again.");
    },

    recoverSession: async (): Promise<User | null> => {
        if (!supabase) return null;
        // Check if we have an active session in Supabase client (e.g. after OAuth redirect)
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
             const user: User = {
                id: data.session.user.id,
                username: data.session.user.email?.split('@')[0] || 'User',
                role: 'Analyst',
                clearanceLevel: 2,
                token: data.session.access_token
            };
            localStorage.setItem(AUTH_KEY, JSON.stringify(user));
            return user;
        }
        return null;
    },

    logout: async () => {
      if (supabase) {
        // Fix: Cast to any to avoid type errors if definition is missing signOut
        await (supabase.auth as any).signOut();
      }
      localStorage.removeItem(AUTH_KEY);
    },

    getSession: (): User | null => {
      const str = localStorage.getItem(AUTH_KEY);
      return str ? JSON.parse(str) : null;
    }
  },

  records: {
    list: async (): Promise<AnalysisResult[]> => {
      // 1. Try Supabase Data
      if (supabase) {
        const { data, error } = await supabase
          .from('analysis_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
          
        if (!error && data) {
          return data.map((row: any) => ({
             id: row.id,
             score: row.score,
             verdict: row.verdict,
             riskLevel: row.risk_level as RiskLevel, // Map snake_case from DB
             reasoning: row.reasoning,
             indicators: row.indicators,
             timestamp: row.created_at, // Map created_at to timestamp
             mediaType: row.media_type,
             fileName: row.file_name,
             liveness: row.liveness
          }));
        } else if (error) {
             console.warn("Supabase fetch error (likely RLS or Table missing):", error.message);
        }
      }

      // 2. Fallback Local Data
      return getLocalDb();
    },

    create: async (record: AnalysisResult): Promise<void> => {
      // 1. Try Supabase Insert
      let supabaseSuccess = false;
      if (supabase) {
        const dbRecord = {
          score: record.score,
          verdict: record.verdict,
          risk_level: record.riskLevel, // snake_case for DB
          reasoning: record.reasoning,
          indicators: record.indicators,
          media_type: record.mediaType,
          file_name: record.fileName,
          liveness: record.liveness
          // created_at is auto-generated by DB
        };
        
        const { error } = await supabase.from('analysis_logs').insert([dbRecord]);
        if (error) {
          console.warn("Supabase insert failed (likely RLS or Table missing):", error.message);
        } else {
            supabaseSuccess = true;
        }
      }

      // 2. Fallback Local Insert
      // We always save locally as a backup for the demo experience
      const db = getLocalDb();
      const newRecord = { ...record, id: `case_${Date.now()}` };
      db.unshift(newRecord);
      if (db.length > 100) db.pop();
      saveLocalDb(db);
    },

    clear: async (): Promise<void> => {
      if (supabase) {
          // Dangerous operation, usually restricted by RLS (Row Level Security)
          // We will attempt to delete where id is not null (all rows)
          await supabase.from('analysis_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000'); 
      }
      localStorage.removeItem(DB_KEY);
    }
  },

  stats: {
    getSummary: async (): Promise<DashboardStat[]> => {
      // We reuse the list function to get data and aggregate client-side 
      // This ensures consistency between the two modes without writing complex separate SQL stats queries
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