import { useState, useEffect, useCallback } from 'react';
import { DashboardData, DashboardFilters, DashboardHookReturn } from '../types/Dashboard.types';
import { getDashboardData } from '../services/dashboardService';

interface UseDashboardOptions {
  refreshInterval?: number;
  autoRefresh?: boolean;
}

/**
 * Custom hook for managing dashboard data and state
 */
export const useDashboard = (options: UseDashboardOptions = {}): DashboardHookReturn => {
  const { refreshInterval = 30000, autoRefresh = true } = options;
  
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>({
    period: '30d'
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const dashboardData = await getDashboardData(filters);
      setData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto refresh interval
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (!loading) {
        fetchData();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchData, loading, refreshInterval, autoRefresh]);

  return {
    data,
    loading,
    error,
    refresh,
    filters,
    setFilters
  };
};
