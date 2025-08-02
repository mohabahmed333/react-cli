import chalk from 'chalk';
import path from 'path';
import { CLIConfig } from '../../../../utils/config/config';
import { createGeneratedFile } from '../../../../utils/createGeneratedFile/createGeneratedFile';
import { GeneratorType } from '../../../../types/generator-type';
import { generateRouteForPage } from '../../../../utils/createRoutes/routeUtils';
import { PageOptions, FileToGenerate } from './pageTypes';
import { 
  generatePageContent, 
  generateTestContent, 
  generateHookContent, 
  generateUtilsContent,
  generateTypesContent,
  generateLibContent,
  generateCSSContent,
  generateLayoutContent,
  convertToValidComponentName
} from '../generators/pageContentGenerators';
import { generatePerformanceHookContent, generatePerformanceWrapperContent } from '../generators/performanceGenerators';
import { generateAIPrompt } from '../generators/aiPromptGenerators';

/**
 * Validate page name
 */
export function isValidPageName(name: string): boolean {
  // Allow PascalCase or dynamic routes like _[id], _[productId]
  return /^[A-Z][a-zA-Z0-9]*$/.test(name) || /^_\[[a-zA-Z][a-zA-Z0-9]*\]$/.test(name);
}

/**
 * Get all files to generate for a page
 */
export async function getFilesToGenerate(
  name: string, 
  options: PageOptions, 
  config: CLIConfig, 
  basePath: string
): Promise<FileToGenerate[]> {
  const useTS = config.typescript;
  const files: FileToGenerate[] = [];

  // Main page file
  files.push({
    type: 'page',
    name: name,
    targetDir: basePath,
    useTS,
    content: generatePageContent(name, options, useTS),
    aiOptions: {
      features: options.aiFeatures || '',
      additionalPrompt: generateAIPrompt(name, options, useTS)
    }
  });

  // Additional files based on options
  if (options.css) {
    files.push({
      type: 'css',
      name: `${name}.module`,
      targetDir: basePath,
      useTS: false,
      content: generateCSSContent(name)
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
    const hooksDir = path.join(basePath, 'hooks');
    files.push({
      type: 'hook',
      name: `use${name}`,
      targetDir: hooksDir,
      useTS,
      content: generateHookContent(name, useTS)
    });
  }

  if (options.utils) {
    const utilsDir = path.join(basePath, 'utils');
    files.push({
      type: 'utils',
      name: `${name}Utils`,
      targetDir: utilsDir,
      useTS,
      content: generateUtilsContent(name, useTS)
    });
  }

  if (options.types && useTS) {
    const typesDir = path.join(basePath, 'types');
    files.push({
      type: 'types',
      name: `${name}.types`,
      targetDir: typesDir,
      useTS,
      content: generateTypesContent(name)
    });
  }

  if (options.lib) {
    const libDir = path.join(basePath, 'lib');
    files.push({
      type: 'lib',
      name: 'constants',
      targetDir: libDir,
      useTS,
      content: generateLibContent(name, useTS)
    });
  }

  if (options.layout && config.projectType === 'next') {
    files.push({
      type: 'layout',
      name: 'layout',
      targetDir: basePath,
      useTS,
      content: generateLayoutContent(useTS)
    });
  }

  // Performance monitoring hook
  if (options.perfHook) {
    const hooksDir = path.join(basePath, 'hooks');
    files.push({
      type: 'hook',
      name: `use${name}Performance`,
      targetDir: hooksDir,
      useTS,
      content: generatePerformanceHookContent(name, useTS)
    });
  }

  // Performance monitoring component wrapper
  if (options.perfMonitoring) {
    const componentsDir = path.join(basePath, 'components');
    files.push({
      type: 'component',
      name: `${name}PerformanceWrapper`,
      targetDir: componentsDir,
      useTS,
      content: generatePerformanceWrapperContent(name, useTS)
    });
  }

  return files;
}

/**
 * Main function to create a page
 */
export async function createPage(name: string, options: PageOptions, config: CLIConfig): Promise<void> {
  const useTS = config.typescript;
  const ext = useTS ? 'tsx' : 'jsx';
  const basePath = config.projectType === 'next'
    ? `${config.baseDir}/${config.localization ? '[lang]/' : ''}${name}`
    : `${config.baseDir}/${name}`;

  const filesToGenerate = await getFilesToGenerate(name, options, config, basePath);

  // Create all files in a loop
  for (const file of filesToGenerate) {
    await createGeneratedFile({
      rl: options.rl!,
      config,
      type: file.type as GeneratorType,
      name: file.name,
      targetDir: file.targetDir,
      useTS: file.useTS,
      replace: false,
      defaultContent: file.content,
      aiOptions: file.aiOptions
    });
  }

  console.log(chalk.green.bold(`\nCreated ${name} page at ${basePath}`));

  // Auto-generate route for React projects (not Next.js)
  if (options.route !== false && config.projectType === 'react') {
    try {
      const success = await generateRouteForPage(name, basePath, config);
      if (success) {
        console.log(chalk.green(`🛣️ Automatically added route for ${name}`));
      }
    } catch (error) {
      console.log(chalk.yellow(`⚠️ Could not generate route automatically: ${error instanceof Error ? error.message : error}`));
      console.log(chalk.dim(`   You can add the route manually to your routes file.`));
    }
  }

  // Setup build audit if requested
  if (options.auditOnBuild) {
    console.log(chalk.blue('\n📊 Performance audit has been configured to run after builds'));
    console.log(chalk.dim('   Use `npm run build` to trigger the audit'));
  }

  // Show performance monitoring usage tips
  if (options.perfHook || options.perfMonitoring) {
    console.log(chalk.blue('\n⏱️ Performance Monitoring Setup Complete'));
    if (options.perfHook) {
      console.log(chalk.dim('   • Performance hook available for custom measurements'));
      console.log(chalk.dim('   • Use startMeasure() and endMeasure() in your component'));
    }
    if (options.perfMonitoring) {
      console.log(chalk.dim('   • Performance wrapper component created'));
      console.log(chalk.dim('   • Metrics will be displayed in development mode'));
    }
  }
}
