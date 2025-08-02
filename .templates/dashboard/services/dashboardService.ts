import { DashboardData, DashboardFilters } from '../types/Dashboard.types';

// Mock API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Dashboard service for fetching analytics data
 */
export class DashboardService {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch dashboard analytics data
   */
  async getDashboardData(filters: DashboardFilters): Promise<DashboardData> {
    try {
      // Simulate API call
      await delay(800);

      // In a real implementation, this would be an actual API call
      // const response = await fetch(`${this.baseUrl}/dashboard?period=${filters.period}`);
      // return await response.json();

      return this.generateMockData(filters);
    } catch (error) {
      throw new Error(`Failed to fetch dashboard data: ${error}`);
    }
  }

  /**
   * Generate mock data for development/demo purposes
   */
  private generateMockData(filters: DashboardFilters): DashboardData {
    const multiplier = filters.period === '7d' ? 0.3 : filters.period === '90d' ? 2.5 : 1;

    return {
      totalUsers: Math.floor(12543 * multiplier),
      userGrowth: +(Math.random() * 20 - 5).toFixed(1),
      revenue: Math.floor(45780 * multiplier),
      revenueGrowth: +(Math.random() * 30 - 10).toFixed(1),
      conversionRate: +(Math.random() * 5 + 2).toFixed(1),
      conversionChange: +(Math.random() * 2 - 1).toFixed(1),
      activeSessions: Math.floor(892 * Math.random()),
      sessionChange: +(Math.random() * 40 - 20).toFixed(1),
      userGrowthData: this.generateUserGrowthData(filters.period),
      revenueData: this.generateRevenueData(),
      topPages: this.generateTopPagesData(),
      recentActivity: this.generateRecentActivity()
    };
  }

  private generateUserGrowthData(period: string) {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const data = [];
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        users: Math.floor(Math.random() * 1000 + 500)
      });
    }
    
    return data;
  }

  private generateRevenueData() {
    return [
      { category: 'Subscriptions', amount: 25000 },
      { category: 'One-time Sales', amount: 15000 },
      { category: 'Premium Features', amount: 8000 },
      { category: 'Partnerships', amount: 12000 }
    ];
  }

  private generateTopPagesData() {
    return [
      { path: '/dashboard', views: 8542, bounceRate: 23, avgTime: '4:32' },
      { path: '/products', views: 6231, bounceRate: 31, avgTime: '3:18' },
      { path: '/analytics', views: 4982, bounceRate: 28, avgTime: '5:45' },
      { path: '/settings', views: 3456, bounceRate: 19, avgTime: '2:14' },
      { path: '/profile', views: 2987, bounceRate: 25, avgTime: '3:01' }
    ];
  }

  private generateRecentActivity() {
    return [
      { icon: '👤', text: 'New user registered', time: '2 minutes ago' },
      { icon: '💳', text: 'Payment processed successfully', time: '5 minutes ago' },
      { icon: '📊', text: 'Analytics report generated', time: '12 minutes ago' },
      { icon: '🔔', text: 'System notification sent', time: '18 minutes ago' },
      { icon: '⚙️', text: 'Configuration updated', time: '25 minutes ago' }
    ];
  }
}

// Default instance
const dashboardService = new DashboardService();

/**
 * Get dashboard data using default service instance
 */
export const getDashboardData = (filters: DashboardFilters): Promise<DashboardData> => {
  return dashboardService.getDashboardData(filters);
};

export default dashboardService;
