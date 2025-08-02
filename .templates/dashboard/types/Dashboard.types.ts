export interface DashboardData {
  totalUsers: number;
  userGrowth: number;
  revenue: number;
  revenueGrowth: number;
  conversionRate: number;
  conversionChange: number;
  activeSessions: number;
  sessionChange: number;
  userGrowthData: UserGrowthPoint[];
  revenueData: RevenuePoint[];
  topPages: PageData[];
  recentActivity: ActivityItem[];
}

export interface UserGrowthPoint {
  date: string;
  users: number;
}

export interface RevenuePoint {
  category: string;
  amount: number;
}

export interface PageData {
  path: string;
  views: number;
  bounceRate: number;
  avgTime: string;
}

export interface ActivityItem {
  icon: string;
  text: string;
  time: string;
}

export interface DashboardFilters {
  period: string;
  category?: string;
  region?: string;
}

export interface DashboardHookReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  filters: DashboardFilters;
  setFilters: (filters: DashboardFilters) => void;
}
