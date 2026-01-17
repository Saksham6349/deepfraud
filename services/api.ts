import { AnalysisResult, User, RiskLevel, DashboardStat } from "../types";

// --- MOCK BACKEND INFRASTRUCTURE ---
// In a production environment, these functions would fetch() from your Express/Python server.

const DB_KEY = 'deepfraud_db_v1';
const AUTH_KEY = 'deepfraud_session';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Database
const getDb = (): AnalysisResult[] => {
  const str = localStorage.getItem(DB_KEY);
  return str ? JSON.parse(str) : [];
};

const saveDb = (data: AnalysisResult[]) => {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
};

export const api = {
  auth: {
    login: async (username: string, accessKey: string): Promise<User> => {
      await delay(1500); // Simulate network handshake
      
      // Mock Credentials
      if (username.toLowerCase() === 'admin' && accessKey === 'password') {
        const user: User = {
          id: 'u_8821',
          username: 'Operator_88',
          role: 'Senior Analyst',
          clearanceLevel: 4,
          token: 'sess_' + Math.random().toString(36).substring(2)
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        return user;
      }
      throw new Error("Invalid credentials");
    },
    
    logout: async () => {
      await delay(500);
      localStorage.removeItem(AUTH_KEY);
    },

    getSession: (): User | null => {
      const str = localStorage.getItem(AUTH_KEY);
      return str ? JSON.parse(str) : null;
    }
  },

  records: {
    list: async (): Promise<AnalysisResult[]> => {
      // await delay(600); // Simulate network fetch
      return getDb();
    },

    create: async (record: AnalysisResult): Promise<void> => {
      await delay(800); // Simulate processing/upload
      const db = getDb();
      const newRecord = { ...record, id: `case_${Date.now()}` };
      db.unshift(newRecord);
      // Limit to 100 records for performance
      if (db.length > 100) db.pop();
      saveDb(db);
    },

    clear: async (): Promise<void> => {
      await delay(1000);
      localStorage.removeItem(DB_KEY);
    }
  },

  stats: {
    getSummary: async (): Promise<DashboardStat[]> => {
      const data = getDb();
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