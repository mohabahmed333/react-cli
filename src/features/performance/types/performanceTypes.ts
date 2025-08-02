import type { CLIConfig } from '../../../utils/config/config';

export interface PerformanceAuditOptions {
  url?: string;
  saveBaseline?: boolean;
  compareOnly?: boolean;
  threshold?: string;
}

export interface PerformanceConfig extends CLIConfig {
  perfBaselineDir?: string;
  perfThreshold?: number;
}

export interface PerformanceBaseline {
  url: string;
  timestamp: string;
  score: number;
  metrics: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
    totalBlockingTime: number;
  };
  audits: Record<string, any>;
}

export interface PerformanceResult {
  score: number;
  metrics: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
    totalBlockingTime: number;
  };
  audits: Record<string, any>;
}

export interface OptimizationSuggestion {
  title: string;
  message: string;
  fix: string;
  priority: 'high' | 'medium' | 'low';
}
