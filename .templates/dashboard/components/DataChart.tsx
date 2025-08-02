import React from 'react';

interface DataPoint {
  [key: string]: string | number;
}

interface DataChartProps {
  data: DataPoint[];
  type: 'line' | 'bar' | 'area';
  xKey: string;
  yKey: string;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Data visualization chart component
 * Note: In a real implementation, you would use a charting library like Recharts, Chart.js, or D3
 */
export const DataChart: React.FC<DataChartProps> = ({
  data,
  type,
  xKey,
  yKey,
  width = 400,
  height = 300,
  className
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={`data-chart empty ${className || ''}`} style={{ width, height }}>
        <p>No data available</p>
      </div>
    );
  }

  // Simple SVG chart implementation for demonstration
  // In production, replace with a proper charting library
  const maxValue = Math.max(...data.map(d => Number(d[yKey])));
  const minValue = Math.min(...data.map(d => Number(d[yKey])));
  const range = maxValue - minValue || 1;

  const getX = (index: number) => (index / (data.length - 1)) * (width - 60) + 30;
  const getY = (value: number) => height - 30 - ((value - minValue) / range) * (height - 60);

  const renderLineChart = () => {
    const points = data.map((d, i) => `${getX(i)},${getY(Number(d[yKey]))}`).join(' ');
    
    return (
      <svg width={width} height={height} className="chart-svg">
        <polyline
          points={points}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
        />
        {data.map((d, i) => (
          <circle
            key={i}
            cx={getX(i)}
            cy={getY(Number(d[yKey]))}
            r="4"
            fill="#3b82f6"
          />
        ))}
      </svg>
    );
  };

  const renderBarChart = () => {
    const barWidth = (width - 60) / data.length * 0.8;
    
    return (
      <svg width={width} height={height} className="chart-svg">
        {data.map((d, i) => {
          const barHeight = ((Number(d[yKey]) - minValue) / range) * (height - 60);
          const x = getX(i) - barWidth / 2;
          const y = height - 30 - barHeight;
          
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill="#10b981"
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div className={`data-chart ${type} ${className || ''}`}>
      {type === 'line' && renderLineChart()}
      {type === 'bar' && renderBarChart()}
      {type === 'area' && renderLineChart()} {/* Simplified for demo */}
      
      <div className="chart-labels">
        <div className="x-labels">
          {data.map((d, i) => (
            <span key={i} className="x-label">
              {String(d[xKey])}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataChart;
