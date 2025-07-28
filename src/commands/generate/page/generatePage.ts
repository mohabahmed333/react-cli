import { createPerfHook } from '../../../features/performance/hooks/perfHook';
import { setupBuildAudit } from '../../../features/performance/build/buildAudit';
import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { Interface as ReadlineInterface } from 'readline';
import { GenerateOptions } from '../../../utils/generateAIHelper';
import { handleInteractiveName } from '../../../utils/shared/handleInteractiveName';
import { handleTargetDirectory } from '../../../utils/file/handleTargetDirectory';
import { createGeneratedFile } from '../../../utils/file/createGeneratedFile';
import { CLIConfig, setupConfiguration } from '../../../utils/config';
import { askQuestion } from '../../../utils/prompt';
import { GeneratorType } from '../../../types/generator-type';
import { TReadlineInterface } from '../../../types/ReadLineInterface';
import { generateRouteForPage } from '../../../utils/routeUtils';
import { isValidPageName } from '../type/typeHelpers';

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

  // No need to handle AI generation here - createGeneratedFile will handle it
  // Just pass the AI features if they were provided

  // Main page file
  files.push({
    type: 'page',
    name: name,
    targetDir: basePath,
    useTS,
    content: generatePageContent(name, options, useTS),
    aiOptions: {
      features: options.aiFeatures || '', // Pass features if provided, empty string if not
      additionalPrompt: generateAIPrompt(name, options, useTS)
    }
  });

  // Additional files based on options
  if (options.css) {
    files.push({
      type: 'css',
      name: `${name}.module.css`,
      targetDir: basePath,
      useTS: false,
      content: `.container {\n  padding: 20px;\n}\n`
    });
  }

  if (options.test) {
    files.push({
      type: 'test',
      name: `${name}.test`,
      targetDir: basePath,
      useTS,
      content: generateTestContent(name, useTS)
    });
  }

  if (options.hooks) {
    files.push({
      type: 'hook',
      name: `use${name}`,
      targetDir: `${config.baseDir}/hooks`,
      useTS,
      content: generateHookContent(name, useTS)
    });
  }

  if (options.utils) {
    files.push({
      type: 'utils',
      name: `${name}Utils`,
      targetDir: `${config.baseDir}/utils`,
      useTS,
      content: generateUtilsContent(name, useTS)
    });
  }

  if (options.types && useTS) {
    files.push({
      type: 'types',
      name: `${name}.types`,
      targetDir: `${config.baseDir}/types`,
      useTS: true,
      content: generateTypesContent(name)
    });
  }

  if (options.lib) {
    files.push({
      type: 'lib',
      name: 'constants.ts',
      targetDir: `${basePath}/lib`,
      useTS: true,
      content: generateLibContent(name, useTS)
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
      targetDir: `${config.baseDir}/hooks`,
      useTS,
      content: generatePerformanceHookContent(name, useTS)
    });
  }

  // Performance monitoring component wrapper
  if (options.perfMonitoring) {
    files.push({
      type: 'component',
      name: `${name}PerformanceWrapper`,
      targetDir: `${basePath}/components`,
      useTS,
      content: generatePerformanceWrapperContent(name, useTS)
    });
  }

  return files;
}

// Content generation helper functions
function generatePageContent(name: string, options: PageOptions, useTS: boolean): string {
  const componentName = convertToValidComponentName(name);
  const perfHookImport = options.perfHook ? `\nimport { use${name}Performance } from '../hooks/use${name}Performance';` : '';
  const perfWrapperImport = options.perfMonitoring ? `\nimport ${name}PerformanceWrapper from './components/${name}PerformanceWrapper';` : '';
  const perfHookUsage = options.perfHook ? `\n  const { startMeasure, endMeasure } = use${name}Performance();` : '';
  
  const contentDiv = options.css 
    ? `<div className={styles.container}>
      <h1>${componentName} Page</h1>
    </div>`
    : `<div>
      <h1>${componentName} Page</h1>
    </div>`;
    
  const wrappedContent = options.perfMonitoring 
    ? `<${name}PerformanceWrapper showMetrics={process.env.NODE_ENV === 'development'}>
      ${contentDiv}
    </${name}PerformanceWrapper>`
    : contentDiv;
  
  return useTS
    ? `import React from 'react';${options.css ? `\nimport styles from './${name}.module.css';` : ''}${perfHookImport}${perfWrapperImport}

interface ${componentName}Props {}

const ${componentName}: React.FC<${componentName}Props> = () => {${perfHookUsage}
  return (
    ${wrappedContent}
  );
};

export default ${componentName};
`
    : `import React from 'react';${options.css ? `\nimport styles from './${name}.module.css';` : ''}${perfHookImport}${perfWrapperImport}

const ${componentName} = () => {${perfHookUsage}
  return (
    ${wrappedContent}
  );
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
    ? `import { useState } from 'react';\n\nexport const use${name} = (): [boolean, () => void] => {\n  const [state, setState] = useState(false);\n  const toggle = () => setState(!state);\n  return [state, toggle];\n};\n`
    : `import { useState } from 'react';\n\nexport const use${name} = () => {\n  const [state, setState] = useState(false);\n  const toggle = () => setState(!state);\n  return [state, toggle];\n};\n`;
}

function generateUtilsContent(name: string, useTS: boolean): string {
  return useTS
    ? `export const format${name} = (input: string): string => {\n  return input.toUpperCase();\n};\n`
    : `export const format${name} = (input) => {\n  return input.toUpperCase();\n};\n`;
}

function generateTypesContent(name: string): string {
  return `export interface ${name}Props {\n  // Add props here\n}\n\nexport type ${name}Type = {\n  id: string;\n  name: string;\n};\n`;
}

function generateLibContent(name: string, useTS: boolean): string {
  return useTS
    ? `export const ${name.toUpperCase()}_CONSTANT: string = 'value';\n`
    : `export const ${name.toUpperCase()}_CONSTANT = 'value';\n`;
}

function generateLayoutContent(useTS: boolean): string {
  return useTS
    ? `import { ReactNode } from 'react';\n\nexport default function Layout({ children }: { children: ReactNode }) {\n  return (\n    <div>\n      <main>{children}</main>\n    </div>\n  );\n}\n`
    : `export default function Layout({ children }) {\n  return (\n    <div>\n      <main>{children}</main>\n    </div>\n  );\n}\n`;
}

function generateAIPrompt(name: string, options: PageOptions, useTS: boolean): string {
  const features = [
    options.css && 'CSS modules',
    options.components && 'components folder',
    options.lib && 'lib utilities',
    options.hooks && 'custom hooks',
    options.utils && 'utility functions',
    options.types && 'TypeScript types',
    options.layout && 'layout file',
    options.perfHook && 'performance monitoring hook',
    options.perfMonitoring && 'performance monitoring wrapper'
  ].filter(Boolean).join(', ');

  return `Create a ${name} page in ${useTS ? 'TypeScript' : 'JavaScript'} with: ${features}`;
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