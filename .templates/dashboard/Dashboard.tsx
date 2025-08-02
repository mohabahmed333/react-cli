import React from 'react';
import { useDashboard } from './hooks/useDashboard';
import { DashboardCard } from './components/DashboardCard';
import { DataChart } from './components/DataChart';
import { DashboardData } from './types/Dashboard.types';
import styles from './Dashboard.module.css';

interface DashboardProps {
  className?: string;
  refreshInterval?: number;
}

/**
 * Dashboard component with analytics, charts, and data visualization
 */
export const Dashboard: React.FC<DashboardProps> = ({ 
  className, 
  refreshInterval = 30000 
}) => {
  const { 
    data, 
    loading, 
    error, 
    refresh,
    filters,
    setFilters 
  } = useDashboard({ refreshInterval });

  if (loading) {
    return (
      <div className={`${styles.dashboard} ${className || ''}`}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${styles.dashboard} ${className || ''}`}>
        <div className={styles.error}>
          <h3>Dashboard Error</h3>
          <p>{error}</p>
          <button onClick={refresh} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.dashboard} ${className || ''}`}>
      <header className={styles.header}>
        <h1>Dashboard</h1>
        <div className={styles.controls}>
          <button onClick={refresh} className={styles.refreshButton}>
            Refresh
          </button>
          <select 
            value={filters.period} 
            onChange={(e) => setFilters({ ...filters, period: e.target.value })}
            className={styles.filterSelect}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </header>

      <div className={styles.metrics}>
        <DashboardCard
          title="Total Users"
          value={data?.totalUsers || 0}
          change={data?.userGrowth}
          icon="👥"
        />
        <DashboardCard
          title="Revenue"
          value={`$${data?.revenue?.toLocaleString() || 0}`}
          change={data?.revenueGrowth}
          icon="💰"
        />
        <DashboardCard
          title="Conversion Rate"
          value={`${data?.conversionRate || 0}%`}
          change={data?.conversionChange}
          icon="📈"
        />
        <DashboardCard
          title="Active Sessions"
          value={data?.activeSessions || 0}
          change={data?.sessionChange}
          icon="🔥"
        />
      </div>

      <div className={styles.charts}>
        <div className={styles.chartContainer}>
          <h3>User Growth</h3>
          <DataChart 
            data={data?.userGrowthData || []} 
            type="line"
            xKey="date"
            yKey="users"
          />
        </div>
        <div className={styles.chartContainer}>
          <h3>Revenue Breakdown</h3>
          <DataChart 
            data={data?.revenueData || []} 
            type="bar"
            xKey="category"
            yKey="amount"
          />
        </div>
      </div>

      <div className={styles.tables}>
        <div className={styles.tableContainer}>
          <h3>Top Pages</h3>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Page</th>
                <th>Views</th>
                <th>Bounce Rate</th>
                <th>Avg. Time</th>
              </tr>
            </thead>
            <tbody>
              {data?.topPages?.map((page, index) => (
                <tr key={index}>
                  <td>{page.path}</td>
                  <td>{page.views.toLocaleString()}</td>
                  <td>{page.bounceRate}%</td>
                  <td>{page.avgTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.tableContainer}>
          <h3>Recent Activity</h3>
          <div className={styles.activityList}>
            {data?.recentActivity?.map((activity, index) => (
              <div key={index} className={styles.activityItem}>
                <span className={styles.activityIcon}>{activity.icon}</span>
                <div className={styles.activityContent}>
                  <p className={styles.activityText}>{activity.text}</p>
                  <small className={styles.activityTime}>{activity.time}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
