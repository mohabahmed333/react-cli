import { Command } from 'commander';
import chalk from 'chalk';
import { Interface as ReadlineInterface } from 'readline';
import { CLIConfig, setupConfiguration } from '../../../utils/config/config';
import { askQuestion } from '../../../utils/ai/prompt';
import { handleTargetDirectory } from '../../../utils/createGeneratedFile/handleTargetDirectory';
import { generateRouteForPage } from '../../../utils/createRoutes/routeUtils';
import { PageOptions } from './core/pageTypes';
import { createPage, isValidPageName } from './core/pageCore';

// Re-export types for external use
export { PageOptions };

/**
 * Register the page generation command
 */
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
          options.aiFeatures = 'AI_REQUESTED';
        }

        // Set default route option for React projects if not explicitly set
        if (options.route === undefined && config.projectType === 'react') {
          options.route = true; // Default to true for React projects
        }

        // Create custom config with target directory
        const customConfig = { ...config, baseDir: targetDir, typescript: useTS };
        options.rl = rl; // Pass readline interface to options
        
        // Create the page
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
        } else if (config.projectType === 'next') {
          console.log(chalk.dim('ℹ️  Next.js uses file-based routing - no route generation needed'));
        }

      } catch (error) {
        console.error(chalk.red('❌ Error generating page:'), error instanceof Error ? error.message : error);
      } finally {
        rl.close();
      }
    });
}