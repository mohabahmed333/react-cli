import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: string;
  className?: string;
}

/**
 * Dashboard metric card component
 */
export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  change,
  icon,
  className
}) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div className={`dashboard-card ${className || ''}`}>
      <div className="card-header">
        {icon && <span className="card-icon">{icon}</span>}
        <h3 className="card-title">{title}</h3>
      </div>
      
      <div className="card-content">
        <div className="card-value">{value}</div>
        
        {change !== undefined && (
          <div className={`card-change ${isPositive ? 'positive' : isNegative ? 'negative' : 'neutral'}`}>
            <span className="change-indicator">
              {isPositive ? '↗' : isNegative ? '↘' : '→'}
            </span>
            <span className="change-value">
              {Math.abs(change)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;
