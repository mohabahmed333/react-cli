import { createPerfHook } from '../../../features/performance/hooks/perfHook';
import { setupBuildAudit } from '../../../features/performance/build/buildAudit';
import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { Interface as ReadlineInterface } from 'readline';
import { GenerateOptions } from '../../../utils/ai/generateAIHelper';
import { handleInteractiveName } from '../../../utils/shared/handleInteractiveName';
import { handleTargetDirectory } from '../../../utils/createGeneratedFile/handleTargetDirectory';
import { createGeneratedFile } from '../../../utils/createGeneratedFile/createGeneratedFile';
import { CLIConfig, setupConfiguration } from '../../../utils/config/config';
import { askQuestion } from '../../../utils/ai/prompt';
import { GeneratorType } from '../../../types/generator-type';
import { TReadlineInterface } from '../../../types/ReadLineInterface';
import { generateRouteForPage } from '../../../utils/createRoutes/routeUtils';
import { isValidPageName } from '../type/typeHelpers';
import { generatePageWithAI, PageAIGenerationResult } from '../../../services/pageAIService';
import { shouldOfferAI } from '../../../utils/config/ai/aiConfig';

/**
 * Convert dynamic route pattern to valid component name
 * Examples: _[id] -> DynamicId, _[productId] -> DynamicProductId
 */
function convertToValidComponentName(pageName: string): string {
  if (pageName.startsWith('_[') && pageName.endsWith(']')) {
    const param = pageName.slice(2, -1);
    // Convert camelCase to PascalCase and add Dynamic prefix
    const pascalParam = param.charAt(0).toUpperCase() + param.slice(1);
    return `Dynamic${pascalParam}`;
  }
  return pageName;
}

/**
 * Check if multiple files will be generated (useful for AI coordination)
 */
function hasMultipleFiles(options: PageOptions): boolean {
  return !!(options.hooks || options.utils || options.types || options.css || options.lib || options.test);
}

export interface PageOptions extends GenerateOptions {
  css?: boolean;
  test?: boolean;
  components?: boolean;
  lib?: boolean;
  hooks?: boolean;
  utils?: boolean;
  types?: boolean;
  layout?: boolean;
  next?: boolean;
  intl?: boolean;
  route?: boolean;
  perfHook?: boolean;
  perfMonitoring?: boolean;
  auditOnBuild?: boolean;
  rl?: TReadlineInterface;
}

export async function createPage(name: string, options: PageOptions, config: CLIConfig) {
  const useTS = config.typescript;
  const ext = useTS ? 'tsx' : 'jsx';
  const basePath = config.projectType === 'next'
    ? `${config.baseDir}/${config.localization ? '[lang]/' : ''}${name}`
    : `${config.baseDir}/${name}`;

  const filesToGenerate = await getFilesToGenerate(name, options, config, basePath);

  // Create all files in a loop
  for (const file of filesToGenerate) {
    await createGeneratedFile({
      rl: options.rl as TReadlineInterface,
      config,
      type: file.type as GeneratorType,
      name: file.name,
      targetDir: file.targetDir,
      useTS: file.useTS,
      replace: options.replace ?? false,
      defaultContent: file.content,
      aiOptions: file.aiOptions
    });
  }

  console.log(chalk.green.bold(`\nCreated ${name} page at ${basePath}`));

  // Setup build audit if requested
  if (options.auditOnBuild) {
    console.log(chalk.cyan('\n🔧 Setting up performance audit scripts...'));
    await setupBuildAudit(`${basePath}/${name}`, config);
  }

  // Show performance monitoring usage tips
  if (options.perfHook || options.perfMonitoring) {
    console.log(chalk.cyan('\n📊 Performance Monitoring Tips:'));
    if (options.perfHook) {
      console.log(chalk.blue(`  • Use the use${name}Performance hook to measure custom operations`));
      console.log(chalk.blue(`  • Call startMeasure('operation') and endMeasure('operation')`));
    }
    if (options.perfMonitoring) {
      console.log(chalk.blue(`  • The PerformanceWrapper shows metrics in development mode`));
      console.log(chalk.blue(`  • Set showMetrics={true} to always display metrics`));
    }
    if (options.auditOnBuild) {
      console.log(chalk.blue('  • Run "npm run perf:audit" to audit this page'));
      console.log(chalk.blue('  • Run "npm run perf:baseline" to save performance baseline'));
    }
  }
}

async function getFilesToGenerate(name: string, options: PageOptions, config: CLIConfig, basePath: string) {
  const useTS = config.typescript;
  const files = [];

  // Check if we should use coordinated AI generation
  const canUseAI = shouldOfferAI(config, 'codeGeneration');
  const hasMultiple = hasMultipleFiles(options);
  
  let aiGeneratedFiles: PageAIGenerationResult | null = null;

  // If AI is available, multiple files are requested, and we have readline interface
  // try coordinated AI generation for better file integration
  if (canUseAI && hasMultiple && options.rl) {
    try {
      console.log(chalk.cyan('\n🤖 Multiple files detected. Offering coordinated AI generation for better integration...'));
      
      const useCoordinatedAI = await askQuestion(
        options.rl,
        chalk.blue('Use coordinated AI generation for all files? This ensures better integration between files. (y/n): ')
      );

      if (useCoordinatedAI.toLowerCase() === 'y') {
        let features = options.aiFeatures || '';
        if (!features) {
          features = await askQuestion(
            options.rl,
            chalk.blue(`Describe features for ${name} page (e.g., "user dashboard with charts, real-time data"): `)
          );
        }

        aiGeneratedFiles = await generatePageWithAI({
          name,
          options,
          useTS,
          features,
          config,
          rl: options.rl
        });
      }
    } catch (error) {
      console.log(chalk.yellow('Coordinated AI generation failed, falling back to individual file generation...'));
    }
  }

  // Main page file
  files.push({
    type: 'page',
    name: name,
    targetDir: basePath,
    useTS,
    content: aiGeneratedFiles?.page || generatePageContent(name, options, useTS),
    aiOptions: !aiGeneratedFiles ? {
      features: options.aiFeatures || '',
      additionalPrompt: generateAIPrompt(name, options, useTS)
    } : undefined
  });

  // Additional files based on options
  if (options.css) {
    files.push({
      type: 'css',
      name: `${name}.module.css`,
      targetDir: basePath,
      useTS: false,
      content: aiGeneratedFiles?.css || generateCSSContent(name),
      aiOptions: !aiGeneratedFiles ? {
        features: options.aiFeatures || '',
        additionalPrompt: `Create modern CSS modules for ${name} page with responsive design, dark mode support, and accessibility features. Include styles for main layout, interactive elements, and loading states.`
      } : undefined
    });
  }

  if (options.test) {
    files.push({
      type: 'test',
      name: `${name}.test`,
      targetDir: basePath,
      useTS,
      content: aiGeneratedFiles?.test || generateTestContent(name, useTS),
      aiOptions: !aiGeneratedFiles ? {
        features: options.aiFeatures || '',
        additionalPrompt: `Create comprehensive test file for ${name} page with multiple test cases covering functionality, error states, and user interactions.`
      } : undefined
    });
  }

  if (options.hooks) {
    files.push({
      type: 'hook',
      name: `use${name}`,
      targetDir: `${basePath}/hooks`,
      useTS,
      content: aiGeneratedFiles?.hooks || generateHookContent(name, useTS),
      aiOptions: !aiGeneratedFiles ? {
        features: options.aiFeatures || '',
        additionalPrompt: `Create a custom hook for ${name} page that manages its state and logic. This hook should be specific to the ${name} page functionality.`
      } : undefined
    });
  }

  if (options.utils) {
    files.push({
      type: 'utils',
      name: `${name}Utils`,
      targetDir: `${basePath}/utils`,
      useTS,
      content: aiGeneratedFiles?.utils || generateUtilsContent(name, useTS),
      aiOptions: !aiGeneratedFiles ? {
        features: options.aiFeatures || '',
        additionalPrompt: `Create utility functions specific to ${name} page. Include helper functions that would be commonly used within this page.`
      } : undefined
    });
  }

  if (options.types && useTS) {
    files.push({
      type: 'types',
      name: `${name}.types`,
      targetDir: `${basePath}/types`,
      useTS: true,
      content: aiGeneratedFiles?.types || generateTypesContent(name),
      aiOptions: !aiGeneratedFiles ? {
        features: options.aiFeatures || '',
        additionalPrompt: `Create TypeScript types and interfaces specific to ${name} page. Include props interfaces, state types, and any other types needed for this page.`
      } : undefined
    });
  }

  if (options.lib) {
    files.push({
      type: 'lib',
      name: 'constants.ts',
      targetDir: `${basePath}/lib`,
      useTS: true,
      content: aiGeneratedFiles?.lib || generateLibContent(name, useTS),
      aiOptions: !aiGeneratedFiles ? {
        features: options.aiFeatures || '',
        additionalPrompt: `Create constants and configuration values specific to ${name} page.`
      } : undefined
    });
  }

  if (options.layout && config.projectType === 'next') {
    files.push({
      type: 'layout',
      name: 'layout.tsx',
      targetDir: basePath,
      useTS: true,
      content: generateLayoutContent(useTS)
    });
  }

  // Performance monitoring hook
  if (options.perfHook) {
    files.push({
      type: 'hook',
      name: `use${name}Performance`,
      targetDir: `${basePath}/hooks`,
      useTS,
      content: generatePerformanceHookContent(name, useTS),
      aiOptions: !aiGeneratedFiles ? {
        features: options.aiFeatures || '',
        additionalPrompt: `Create a performance monitoring hook for ${name} page that tracks render times, user interactions, and page-specific metrics.`
      } : undefined
    });
  }

  // Performance monitoring component wrapper
  if (options.perfMonitoring) {
    files.push({
      type: 'component',
      name: `${name}PerformanceWrapper`,
      targetDir: `${basePath}/components`,
      useTS,
      content: generatePerformanceWrapperContent(name, useTS),
      aiOptions: !aiGeneratedFiles ? {
        features: options.aiFeatures || '',
        additionalPrompt: `Create a performance monitoring wrapper component for ${name} page with metrics display and performance tracking.`
      } : undefined
    });
  }

  return files;
}

// Content generation helper functions
function generatePageContent(name: string, options: PageOptions, useTS: boolean): string {
  const componentName = convertToValidComponentName(name);
  
  // Build imports
  const imports = ['import React from \'react\';'];
  
  if (options.css) {
    imports.push(`import styles from './${name}.module.css';`);
  }
  
  if (options.hooks) {
    imports.push(`import { use${name} } from './hooks/use${name}';`);
  }
  
  if (options.utils) {
    imports.push(`import { ${name.toLowerCase()}Utils } from './utils/${name}Utils';`);
  }
  
  if (options.types && useTS) {
    imports.push(`import type { ${componentName}Props, ${name}Type } from './types/${name}.types';`);
  }
  
  if (options.lib) {
    imports.push(`import { ${name.toUpperCase()}_CONSTANT } from './lib/constants';`);
  }
  
  if (options.perfHook) {
    imports.push(`import { use${name}Performance } from './hooks/use${name}Performance';`);
  }
  
  if (options.perfMonitoring) {
    imports.push(`import ${name}PerformanceWrapper from './components/${name}PerformanceWrapper';`);
  }
  
  // Build component content
  const hookUsage = options.hooks ? `\n  const { data, loading, error, refetch } = use${name}();` : '';
  const perfHookUsage = options.perfHook ? `\n  const { startMeasure, endMeasure } = use${name}Performance();` : '';
  
  // Build JSX content
  let contentJsx = '';
  if (options.hooks) {
    contentJsx = `    {loading && <div className={${options.css ? 'styles.loading' : '"loading"'}}>Loading...</div>}
    {error && <div className={${options.css ? 'styles.error' : '"error"'}>Error: {error}</div>}
    {data && (
      <div className={${options.css ? 'styles.content' : '"content"'}}>
        <h1 className={${options.css ? 'styles.title' : '"title"'}}>${componentName} Page</h1>
        <pre>{${options.utils ? `${name.toLowerCase()}Utils.formatData(data)` : 'JSON.stringify(data, null, 2)'}}</pre>
        <button onClick={refetch}>Refresh Data</button>
      </div>
    )}`;
  } else {
    contentJsx = `    <div className={${options.css ? 'styles.header' : '"header"'}}>
      <h1 className={${options.css ? 'styles.title' : '"title"'}}>${componentName} Page</h1>
    </div>
    <div className={${options.css ? 'styles.content' : '"content"'}}>
      <p>Welcome to the ${componentName} page!</p>
    </div>`;
  }
  
  const mainContent = options.css 
    ? `  return (
    <div className={styles.container}>
${contentJsx}
    </div>
  );`
    : `  return (
    <div>
${contentJsx}
    </div>
  );`;
    
  const wrappedContent = options.perfMonitoring 
    ? `  return (
    <${name}PerformanceWrapper showMetrics={process.env.NODE_ENV === 'development'}>
      <div${options.css ? ' className={styles.container}' : ''}>
${contentJsx}
      </div>
    </${name}PerformanceWrapper>
  );`
    : mainContent;
  
  const propsInterface = useTS && options.types 
    ? `interface ${componentName}Props {}`
    : `interface ${componentName}Props {}`;
  
  return useTS
    ? `${imports.join('\n')}

${propsInterface}

const ${componentName}: React.FC<${componentName}Props> = () => {${hookUsage}${perfHookUsage}
${wrappedContent}
};

export default ${componentName};
`
    : `${imports.join('\n')}

const ${componentName} = () => {${hookUsage}${perfHookUsage}
${wrappedContent}
};

export default ${componentName};
`;
}

function generateTestContent(name: string, useTS: boolean): string {
  const componentName = convertToValidComponentName(name);
  return useTS
    ? `import { render, screen } from '@testing-library/react';\nimport ${componentName} from './${name}';\n\ndescribe('${componentName}', () => {\n  it('renders', () => {\n    render(<${componentName} />);\n    expect(screen.getByText('${componentName} Page')).toBeInTheDocument();\n  });\n});\n`
    : `import { render, screen } from '@testing-library/react';\nimport ${componentName} from './${name}';\n\ntest('renders ${componentName}', () => {\n  render(<${componentName} />);\n  expect(screen.getByText('${componentName} Page')).toBeInTheDocument();\n});\n`;
}

function generateHookContent(name: string, useTS: boolean): string {
  return useTS
    ? `import { useState, useEffect, useCallback } from 'react';
import type { ${name}Type } from '../types/${name}.types';

interface Use${name}Return {
  data: ${name}Type | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const use${name} = (): Use${name}Return => {
  const [data, setData] = useState<${name}Type | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Replace with actual API call
      const response = await fetch('/api/${name.toLowerCase()}');
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};`
    : `import { useState, useEffect, useCallback } from 'react';

export const use${name} = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // TODO: Replace with actual API call
      const response = await fetch('/api/${name.toLowerCase()}');
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};`;
}

function generateUtilsContent(name: string, useTS: boolean): string {
  return useTS
    ? `/**
 * Utility functions for ${name} page
 */

export const ${name.toLowerCase()}Utils = {
  /**
   * Format display data for ${name}
   */
  formatData: (data: any): string => {
    if (!data) return 'No data available';
    return typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
  },

  /**
   * Validate ${name} input
   */
  validateInput: (input: string): boolean => {
    return input && input.trim().length > 0;
  },

  /**
   * Generate unique ID for ${name}
   */
  generateId: (): string => {
    return \`${name.toLowerCase()}_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
  },

  /**
   * Parse URL parameters for ${name}
   */
  parseUrlParams: (search: string): Record<string, string> => {
    const params = new URLSearchParams(search);
    const result: Record<string, string> = {};
    params.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  },

  /**
   * Debounce function for ${name} search
   */
  debounce: <T extends (...args: any[]) => void>(func: T, delay: number): T => {
    let timeoutId: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
  }
};`
    : `/**
 * Utility functions for ${name} page
 */

export const ${name.toLowerCase()}Utils = {
  /**
   * Format display data for ${name}
   */
  formatData: (data) => {
    if (!data) return 'No data available';
    return typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
  },

  /**
   * Validate ${name} input
   */
  validateInput: (input) => {
    return input && input.trim().length > 0;
  },

  /**
   * Generate unique ID for ${name}
   */
  generateId: () => {
    return \`${name.toLowerCase()}_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
  },

  /**
   * Parse URL parameters for ${name}
   */
  parseUrlParams: (search) => {
    const params = new URLSearchParams(search);
    const result = {};
    params.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  },

  /**
   * Debounce function for ${name} search
   */
  debounce: (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }
};`;
}

function generateTypesContent(name: string): string {
  return `/**
 * Type definitions for ${name} page
 */

export interface ${name}Props {
  className?: string;
  onUpdate?: (data: ${name}Type) => void;
  initialData?: ${name}Type;
}

export interface ${name}Type {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface ${name}State {
  data: ${name}Type | null;
  loading: boolean;
  error: string | null;
}

export interface ${name}FormData {
  name: string;
  description?: string;
}

export interface ${name}ApiResponse {
  data: ${name}Type;
  message: string;
  success: boolean;
}

export interface ${name}ListResponse {
  data: ${name}Type[];
  total: number;
  page: number;
  limit: number;
}

export type ${name}Action = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_DATA'; payload: ${name}Type }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };
`;
}

function generateLibContent(name: string, useTS: boolean): string {
  return useTS
    ? `export const ${name.toUpperCase()}_CONSTANT: string = 'value';\n`
    : `export const ${name.toUpperCase()}_CONSTANT = 'value';\n`;
}

function generateCSSContent(name: string): string {
  return `.container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  margin-bottom: 24px;
}

.title {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--primary-color, #333);
  margin-bottom: 16px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.error {
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  padding: 16px;
  color: #c33;
}

/* Responsive design */
@media (max-width: 768px) {
  .container {
    padding: 16px;
  }
  
  .title {
    font-size: 2rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .title {
    color: var(--primary-color, #fff);
  }
  
  .error {
    background: #4a1a1a;
    border-color: #8a2626;
    color: #ff6b6b;
  }
}
`;
}

function generateLayoutContent(useTS: boolean): string {
  return useTS
    ? `import { ReactNode } from 'react';\n\nexport default function Layout({ children }: { children: ReactNode }) {\n  return (\n    <div>\n      <main>{children}</main>\n    </div>\n  );\n}\n`
    : `export default function Layout({ children }) {\n  return (\n    <div>\n      <main>{children}</main>\n    </div>\n  );\n}\n`;
}

function generateAIPrompt(name: string, options: PageOptions, useTS: boolean): string {
  const features = [
    options.css && 'CSS modules with responsive design',
    options.components && 'reusable child components',
    options.lib && 'constants and configuration utilities',
    options.hooks && 'custom React hooks for state management',
    options.utils && 'utility functions for data processing',
    options.types && 'TypeScript type definitions',
    options.layout && 'layout wrapper component',
    options.perfHook && 'performance monitoring capabilities',
    options.perfMonitoring && 'performance metrics display'
  ].filter(Boolean).join(', ');

  const additionalContext = [
    `The page should be a React ${useTS ? 'TypeScript' : 'JavaScript'} functional component`,
    options.hooks && `Import and use custom hooks from './hooks/use${name}'`,
    options.utils && `Import utility functions from './utils/${name}Utils'`,
    options.types && useTS && `Import types from './types/${name}.types'`,
    options.css && `Use CSS modules with className from './${name}.module.css'`,
    options.lib && `Import constants from './lib/constants'`,
    'Follow React best practices and include proper error handling',
    'Use semantic HTML and accessibility features',
    'Include JSDoc comments for all functions and interfaces'
  ].filter(Boolean).join('\n- ');

  return `Create a comprehensive ${name} page component with the following features: ${features}.

Requirements:
- ${additionalContext}
- Make the component modular and maintainable
- Ensure proper separation of concerns between files
- Include loading states, error handling, and user feedback
- Follow modern React patterns (hooks, functional components)
- Optimize for performance and accessibility

Generate ONLY the main page component code. The supporting files (hooks, utils, types, etc.) will be generated separately with their own AI prompts.`;
}

function generatePerformanceHookContent(name: string, useTS: boolean): string {
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

function generatePerformanceWrapperContent(name: string, useTS: boolean): string {
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

export function registerGeneratePage(generate: Command, rl: ReadlineInterface) {
  generate
    .command('page [name] [folder]')
    .description('Generate a page with components (optionally in a specific folder)')
    .option('--ts', 'Override TypeScript setting')
    .option('--next', 'Override project type as Next.js')
    .option('--intl', 'Override internationalization setting')
    .option('--css', 'Include CSS module')
    .option('--test', 'Include test file')
    .option('--components', 'Include components folder')
    .option('--lib', 'Include lib utilities')
    .option('--hooks', 'Include custom hooks')
    .option('--utils', 'Include utility functions')
    .option('--types', 'Include TypeScript types')
    .option('--layout', 'Include layout file')
    .option('--route', 'Generate route automatically (default: true for React projects)')
    .option('--no-route', 'Skip route generation')
    .option('--perf-hook', 'Add performance monitoring hook')
    .option('--perf-monitoring', 'Add performance monitoring components')
    .option('--audit-on-build', 'Run performance audit after build')
    .option('-i, --interactive', 'Use interactive mode')
    .option('--ai', 'Use AI to generate the page code')
    .action(async (name: string | undefined, folder: string | undefined, options: PageOptions) => {
      try {
        console.log(chalk.cyan('\n📄 Page Generator'));
        console.log(chalk.dim('======================'));

        const config = await setupConfiguration(rl);
        const useTS = options.useTS ?? config.typescript;

        // Handle page name with custom validation for dynamic routes
        let pageName = name;
        if (!pageName) {
          const promptMessage = chalk.blue('Enter page name (PascalCase or dynamic route like _[id]): ');
          pageName = (await askQuestion(rl, promptMessage)) || '';
        }
        
        // Validate page name
        if (!pageName) {
          console.log(chalk.red('❌ Page name is required'));
          rl.close();
          process.exit(1);
        }
        
        if (!isValidPageName(pageName)) {
          console.log(chalk.red('❌ Page name must be PascalCase (e.g., HomePage) or a dynamic route (e.g., _[id])'));
          rl.close();
          process.exit(1);
        }

        // Handle target directory
        const targetDir = await handleTargetDirectory(
          rl,
          config,
          folder,
          'pages',
          options.interactive ?? false
        );

        // Handle interactive options
        if (options.interactive) {
          const questions = [
            {
              key: 'css',
              question: 'Include CSS module? (y/n): ',
              handler: (answer: string) => options.css = answer.toLowerCase() === 'y'
            },
            {
              key: 'test',
              question: 'Include test file? (y/n): ',
              handler: (answer: string) => options.test = answer.toLowerCase() === 'y'
            },
            {
              key: 'components',
              question: 'Include components folder? (y/n): ',
              handler: (answer: string) => options.components = answer.toLowerCase() === 'y'
            },
            {
              key: 'lib',
              question: 'Include lib utilities? (y/n): ',
              handler: (answer: string) => options.lib = answer.toLowerCase() === 'y'
            },
            {
              key: 'hooks',
              question: 'Include custom hooks? (y/n): ',
              handler: (answer: string) => options.hooks = answer.toLowerCase() === 'y'
            },
            {
              key: 'utils',
              question: 'Include utility functions? (y/n): ',
              handler: (answer: string) => options.utils = answer.toLowerCase() === 'y'
            },
            {
              key: 'types',
              question: 'Include TypeScript types? (y/n): ',
              condition: useTS,
              handler: (answer: string) => options.types = answer.toLowerCase() === 'y'
            },
            {
              key: 'layout',
              question: 'Include layout file? (y/n): ',
              condition: config.projectType === 'next',
              handler: (answer: string) => options.layout = answer.toLowerCase() === 'y'
            },
            {
              key: 'route',
              question: 'Generate route automatically? (y/n): ',
              condition: config.projectType === 'react',
              handler: (answer: string) => options.route = answer.toLowerCase() === 'y'
            },
            {
              key: 'perfHook',
              question: 'Add performance monitoring hook? (y/n): ',
              handler: (answer: string) => options.perfHook = answer.toLowerCase() === 'y'
            },
            {
              key: 'perfMonitoring',
              question: 'Add performance monitoring components? (y/n): ',
              handler: (answer: string) => options.perfMonitoring = answer.toLowerCase() === 'y'
            },
            {
              key: 'auditOnBuild',
              question: 'Run performance audit after build? (y/n): ',
              handler: (answer: string) => options.auditOnBuild = answer.toLowerCase() === 'y'
            }
          ];

          for (const { question, handler, condition } of questions) {
            if (condition !== false) {
              const answer = await askQuestion(rl, chalk.blue(question));
              await handler(answer);
            }
          }
        }

        // Handle --ai flag when not in interactive mode
        if (options.ai) {
          // Set a special marker to indicate AI was requested
          options.aiFeatures = 'AI_REQUESTED';
        }

        // Set default route option for React projects if not explicitly set
        if (options.route === undefined && config.projectType === 'react') {
          options.route = true; // Default to true for React projects
        }

        // Create custom config with target directory
        const customConfig = { ...config, baseDir: targetDir, typescript: useTS };
        options.rl = rl; // Pass readline interface to options
        await createPage(pageName, options, customConfig);

        // Generate route using original config and the actual page path  
        if (options.route !== false && config.projectType === 'react') {
          try {
            const actualPagePath = `${targetDir}/${pageName}`;
            await generateRouteForPage(pageName, actualPagePath, config); // Use original config
          } catch (error) {
            console.log(chalk.yellow(`⚠️ Could not generate route automatically: ${error instanceof Error ? error.message : error}`));
            console.log(chalk.dim(`   You can add the route manually to your routes file.`));
          }
        }
      } catch (error) {
        console.error(chalk.red('❌ Error generating page:'), error instanceof Error ? error.message : error);
      } finally {
        rl.close();
      }
    });
}