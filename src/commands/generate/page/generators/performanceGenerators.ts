/**
 * Generate performance monitoring hook content
 */
export function generatePerformanceHookContent(name: string, useTS: boolean): string {
  const hookName = `use${name}Performance`;
  
  return useTS
    ? `import { useEffect, useCallback, useRef } from 'react';

interface PerformanceMetric {
  name: string;
  duration: number;
  startTime: number;
  endTime: number;
}

export const ${hookName} = () => {
  const metricsRef = useRef<PerformanceMetric[]>([]);
  const activeMarkersRef = useRef<Set<string>>(new Set());

  const startMeasure = useCallback((marker: string) => {
    if (typeof performance === 'undefined') return;
    
    const markName = \`${name}-\${marker}-start\`;
    performance.mark(markName);
    activeMarkersRef.current.add(marker);
    
    console.log(\`⏱️ Started measuring \${marker} for ${name}\`);
  }, []);

  const endMeasure = useCallback((marker: string): PerformanceMetric | null => {
    if (typeof performance === 'undefined') return null;
    if (!activeMarkersRef.current.has(marker)) return null;
    
    const startMarkName = \`${name}-\${marker}-start\`;
    const endMarkName = \`${name}-\${marker}-end\`;
    const measureName = \`${name}-\${marker}-measure\`;
    
    try {
      performance.mark(endMarkName);
      performance.measure(measureName, startMarkName, endMarkName);
      
      const measures = performance.getEntriesByName(measureName);
      const lastMeasure = measures[measures.length - 1];
      
      if (lastMeasure) {
        const metric: PerformanceMetric = {
          name: marker,
          duration: lastMeasure.duration,
          startTime: lastMeasure.startTime,
          endTime: lastMeasure.startTime + lastMeasure.duration
        };
        
        metricsRef.current.push(metric);
        activeMarkersRef.current.delete(marker);
        
        console.log(\`⏱️ ${name} \${marker} took \${lastMeasure.duration.toFixed(2)}ms\`);
        
        // Clean up
        performance.clearMarks(startMarkName);
        performance.clearMarks(endMarkName);
        performance.clearMeasures(measureName);
        
        return metric;
      }
    } catch (error) {
      console.warn(\`Failed to measure \${marker}:\`, error);
    }
    
    return null;
  }, []);

  const getMetrics = useCallback((): PerformanceMetric[] => {
    return [...metricsRef.current];
  }, []);

  // Auto-measure component render
  useEffect(() => {
    startMeasure('render');
    return () => {
      endMeasure('render');
    };
  }, [startMeasure, endMeasure]);

  return {
    startMeasure,
    endMeasure,
    getMetrics
  };
};`
    : `import { useEffect, useCallback, useRef } from 'react';

export const ${hookName} = () => {
  const metricsRef = useRef([]);
  const activeMarkersRef = useRef(new Set());

  const startMeasure = useCallback((marker) => {
    if (typeof performance === 'undefined') return;
    
    const markName = \`${name}-\${marker}-start\`;
    performance.mark(markName);
    activeMarkersRef.current.add(marker);
    
    console.log(\`⏱️ Started measuring \${marker} for ${name}\`);
  }, []);

  const endMeasure = useCallback((marker) => {
    if (typeof performance === 'undefined') return null;
    if (!activeMarkersRef.current.has(marker)) return null;
    
    const startMarkName = \`${name}-\${marker}-start\`;
    const endMarkName = \`${name}-\${marker}-end\`;
    const measureName = \`${name}-\${marker}-measure\`;
    
    try {
      performance.mark(endMarkName);
      performance.measure(measureName, startMarkName, endMarkName);
      
      const measures = performance.getEntriesByName(measureName);
      const lastMeasure = measures[measures.length - 1];
      
      if (lastMeasure) {
        const metric = {
          name: marker,
          duration: lastMeasure.duration,
          startTime: lastMeasure.startTime,
          endTime: lastMeasure.startTime + lastMeasure.duration
        };
        
        metricsRef.current.push(metric);
        activeMarkersRef.current.delete(marker);
        
        console.log(\`⏱️ ${name} \${marker} took \${lastMeasure.duration.toFixed(2)}ms\`);
        
        // Clean up
        performance.clearMarks(startMarkName);
        performance.clearMarks(endMarkName);
        performance.clearMeasures(measureName);
        
        return metric;
      }
    } catch (error) {
      console.warn(\`Failed to measure \${marker}:\`, error);
    }
    
    return null;
  }, []);

  const getMetrics = useCallback(() => {
    return [...metricsRef.current];
  }, []);

  // Auto-measure component render
  useEffect(() => {
    startMeasure('render');
    return () => {
      endMeasure('render');
    };
  }, [startMeasure, endMeasure]);

  return {
    startMeasure,
    endMeasure,
    getMetrics
  };
};`;
}

/**
 * Generate performance wrapper component content
 */
export function generatePerformanceWrapperContent(name: string, useTS: boolean): string {
  const componentName = `${name}PerformanceWrapper`;
  const hookName = `use${name}Performance`;
  
  return useTS
    ? `import React, { useEffect, useState } from 'react';
import { ${hookName} } from '../../hooks/${hookName}';

interface ${componentName}Props {
  children: React.ReactNode;
  showMetrics?: boolean;
}

interface PerformanceMetric {
  name: string;
  duration: number;
  startTime: number;
  endTime: number;
}

const ${componentName}: React.FC<${componentName}Props> = ({ 
  children, 
  showMetrics = false 
}) => {
  const { getMetrics, startMeasure, endMeasure } = ${hookName}();
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);

  useEffect(() => {
    if (showMetrics) {
      const interval = setInterval(() => {
        setMetrics(getMetrics());
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [showMetrics, getMetrics]);

  const handleInteractionStart = (event: string) => {
    startMeasure(\`interaction-\${event}\`);
  };

  const handleInteractionEnd = (event: string) => {
    endMeasure(\`interaction-\${event}\`);
  };

  return (
    <div 
      className="${name.toLowerCase()}-performance-wrapper"
      onMouseEnter={() => handleInteractionStart('hover')}
      onMouseLeave={() => handleInteractionEnd('hover')}
      onClick={() => {
        handleInteractionStart('click');
        setTimeout(() => handleInteractionEnd('click'), 0);
      }}
    >
      {children}
      
      {showMetrics && metrics.length > 0 && (
        <div 
          style={{
            position: 'fixed',
            top: 10,
            right: 10,
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px',
            zIndex: 1000,
            maxWidth: '300px'
          }}
        >
          <h4>⏱️ Performance Metrics</h4>
          {metrics.slice(-5).map((metric, index) => (
            <div key={index}>
              {metric.name}: {metric.duration.toFixed(2)}ms
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ${componentName};`
    : `import React, { useEffect, useState } from 'react';
import { ${hookName} } from '../../hooks/${hookName}';

const ${componentName} = ({ children, showMetrics = false }) => {
  const { getMetrics, startMeasure, endMeasure } = ${hookName}();
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    if (showMetrics) {
      const interval = setInterval(() => {
        setMetrics(getMetrics());
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [showMetrics, getMetrics]);

  const handleInteractionStart = (event) => {
    startMeasure(\`interaction-\${event}\`);
  };

  const handleInteractionEnd = (event) => {
    endMeasure(\`interaction-\${event}\`);
  };

  return (
    <div 
      className="${name.toLowerCase()}-performance-wrapper"
      onMouseEnter={() => handleInteractionStart('hover')}
      onMouseLeave={() => handleInteractionEnd('hover')}
      onClick={() => {
        handleInteractionStart('click');
        setTimeout(() => handleInteractionEnd('click'), 0);
      }}
    >
      {children}
      
      {showMetrics && metrics.length > 0 && (
        <div 
          style={{
            position: 'fixed',
            top: 10,
            right: 10,
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px',
            zIndex: 1000,
            maxWidth: '300px'
          }}
        >
          <h4>⏱️ Performance Metrics</h4>
          {metrics.slice(-5).map((metric, index) => (
            <div key={index}>
              {metric.name}: {metric.duration.toFixed(2)}ms
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ${componentName};`;
}
