import * as path from 'path';
import chalk from 'chalk';
import { createFile } from '../../../utils/createGeneratedFile/file';
import type { PerformanceConfig } from '../types/performanceTypes';

export async function createPerfHook(
  name: string, 
  useTS: boolean, 
  config: PerformanceConfig
): Promise<boolean> {
  const ext = useTS ? 'ts' : 'js';
  const hookName = `use${name}Performance`;
  
  const content = useTS ? generateTypeScriptHook(hookName) : generateJavaScriptHook(hookName);
  
  const filePath = path.join(config.baseDir, 'hooks', `${hookName}.${ext}`);
  
  if (createFile(filePath, content)) {
    console.log(chalk.green(`✅ Created performance hook: ${filePath}`));
    return true;
  } else {
    console.log(chalk.yellow(`⚠️ Performance hook already exists: ${filePath}`));
    return false;
  }
}

function generateTypeScriptHook(hookName: string): string {
  return `import { useEffect, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  startTime: number;
  endTime: number;
  duration: number;
  marker: string;
}

interface UsePerformanceHook {
  startMeasure: (marker: string) => void;
  endMeasure: (marker: string) => PerformanceMetrics | null;
  measureComponent: (componentName: string) => void;
  getMetrics: () => PerformanceMetrics[];
}

export const ${hookName} = (): UsePerformanceHook => {
  const metricsRef = useRef<PerformanceMetrics[]>([]);
  const activeMarkersRef = useRef<Set<string>>(new Set());

  const startMeasure = useCallback((marker: string) => {
    if (typeof performance === 'undefined') return;
    
    const markName = \`\${marker}-start\`;
    performance.mark(markName);
    activeMarkersRef.current.add(marker);
    
    console.log(\`⏱️ Started measuring: \${marker}\`);
  }, []);

  const endMeasure = useCallback((marker: string): PerformanceMetrics | null => {
    if (typeof performance === 'undefined') return null;
    if (!activeMarkersRef.current.has(marker)) return null;
    
    const startMarkName = \`\${marker}-start\`;
    const endMarkName = \`\${marker}-end\`;
    const measureName = \`\${marker}-measure\`;
    
    try {
      performance.mark(endMarkName);
      performance.measure(measureName, startMarkName, endMarkName);
      
      const measures = performance.getEntriesByName(measureName);
      const lastMeasure = measures[measures.length - 1];
      
      if (lastMeasure) {
        const metrics: PerformanceMetrics = {
          startTime: lastMeasure.startTime,
          endTime: lastMeasure.startTime + lastMeasure.duration,
          duration: lastMeasure.duration,
          marker
        };
        
        metricsRef.current.push(metrics);
        activeMarkersRef.current.delete(marker);
        
        console.log(\`⏱️ \${marker} took \${lastMeasure.duration.toFixed(2)}ms\`);
        
        // Clean up performance entries
        performance.clearMarks(startMarkName);
        performance.clearMarks(endMarkName);
        performance.clearMeasures(measureName);
        
        return metrics;
      }
    } catch (error) {
      console.warn(\`Failed to measure \${marker}:\`, error);
    }
    
    return null;
  }, []);

  const measureComponent = useCallback((componentName: string) => {
    startMeasure(\`\${componentName}-render\`);
    
    // Return cleanup function
    return () => endMeasure(\`\${componentName}-render\`);
  }, [startMeasure, endMeasure]);

  const getMetrics = useCallback((): PerformanceMetrics[] => {
    return [...metricsRef.current];
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // End any active measurements
      activeMarkersRef.current.forEach(marker => {
        endMeasure(marker);
      });
    };
  }, [endMeasure]);

  return {
    startMeasure,
    endMeasure,
    measureComponent,
    getMetrics
  };
};

// Higher-order component for automatic performance measuring
export function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name;
  
  const PerformanceTrackedComponent: React.FC<P> = (props) => {
    const { measureComponent } = ${hookName}();
    
    useEffect(() => {
      const cleanup = measureComponent(displayName);
      return cleanup;
    }, [measureComponent]);
    
    return <WrappedComponent {...props} />;
  };
  
  PerformanceTrackedComponent.displayName = \`withPerformanceTracking(\${displayName})\`;
  
  return PerformanceTrackedComponent;
}`;
}

function generateJavaScriptHook(hookName: string): string {
  return `import { useEffect, useCallback, useRef } from 'react';

export const ${hookName} = () => {
  const metricsRef = useRef([]);
  const activeMarkersRef = useRef(new Set());

  const startMeasure = useCallback((marker) => {
    if (typeof performance === 'undefined') return;
    
    const markName = \`\${marker}-start\`;
    performance.mark(markName);
    activeMarkersRef.current.add(marker);
    
    console.log(\`⏱️ Started measuring: \${marker}\`);
  }, []);

  const endMeasure = useCallback((marker) => {
    if (typeof performance === 'undefined') return null;
    if (!activeMarkersRef.current.has(marker)) return null;
    
    const startMarkName = \`\${marker}-start\`;
    const endMarkName = \`\${marker}-end\`;
    const measureName = \`\${marker}-measure\`;
    
    try {
      performance.mark(endMarkName);
      performance.measure(measureName, startMarkName, endMarkName);
      
      const measures = performance.getEntriesByName(measureName);
      const lastMeasure = measures[measures.length - 1];
      
      if (lastMeasure) {
        const metrics = {
          startTime: lastMeasure.startTime,
          endTime: lastMeasure.startTime + lastMeasure.duration,
          duration: lastMeasure.duration,
          marker
        };
        
        metricsRef.current.push(metrics);
        activeMarkersRef.current.delete(marker);
        
        console.log(\`⏱️ \${marker} took \${lastMeasure.duration.toFixed(2)}ms\`);
        
        // Clean up performance entries
        performance.clearMarks(startMarkName);
        performance.clearMarks(endMarkName);
        performance.clearMeasures(measureName);
        
        return metrics;
      }
    } catch (error) {
      console.warn(\`Failed to measure \${marker}:\`, error);
    }
    
    return null;
  }, []);

  const measureComponent = useCallback((componentName) => {
    startMeasure(\`\${componentName}-render\`);
    
    // Return cleanup function
    return () => endMeasure(\`\${componentName}-render\`);
  }, [startMeasure, endMeasure]);

  const getMetrics = useCallback(() => {
    return [...metricsRef.current];
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // End any active measurements
      activeMarkersRef.current.forEach(marker => {
        endMeasure(marker);
      });
    };
  }, [endMeasure]);

  return {
    startMeasure,
    endMeasure,
    measureComponent,
    getMetrics
  };
};

// Higher-order component for automatic performance measuring
export function withPerformanceTracking(WrappedComponent, componentName) {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name;
  
  const PerformanceTrackedComponent = (props) => {
    const { measureComponent } = ${hookName}();
    
    useEffect(() => {
      const cleanup = measureComponent(displayName);
      return cleanup;
    }, [measureComponent]);
    
    return React.createElement(WrappedComponent, props);
  };
  
  PerformanceTrackedComponent.displayName = \`withPerformanceTracking(\${displayName})\`;
  
  return PerformanceTrackedComponent;
}`;
}
