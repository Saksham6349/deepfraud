export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface User {
  id: string;
  username: string;
  role: string;
  clearanceLevel: number;
  token?: string;
}

export interface AnalysisResult {
  id?: string;
  score: number; // 0-100, where 100 is confirmed fraud
  verdict: 'REAL' | 'FAKE' | 'SUSPICIOUS' | 'UNKNOWN';
  riskLevel: RiskLevel;
  reasoning: string;
  indicators: string[];
  timestamp: string;
  mediaType: 'image' | 'audio' | 'video' | 'text';
  fileName?: string;
  liveness?: {
    score: number; // 0-100, where 100 is confirmed Real/Live
    analysis: string;
  };
}

export interface DashboardStat {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface RecentAlert {
  id: string;
  user: string;
  type: string;
  riskScore: number;
  time: string;
  status: 'Pending' | 'Reviewed' | 'Blocked' | 'Verified';
  isReal?: boolean;
}