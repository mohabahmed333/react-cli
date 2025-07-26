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

  return files;
}

// Content generation helper functions
function generatePageContent(name: string, options: PageOptions, useTS: boolean): string {
  return useTS
    ? `import React from 'react';\n${options.css ? `import styles from './${name}.module.css';\n` : ''}\ninterface ${name}Props {}\n\nconst ${name}: React.FC<${name}Props> = () => {\n  return (\n    <div${options.css ? ' className={styles.container}' : ''}>\n      <h1>${name} Page</h1>\n    </div>\n  );\n};\n\nexport default ${name};\n`
    : `import React from 'react';\n${options.css ? `import styles from './${name}.module.css';\n` : ''}\nconst ${name} = () => {\n  return (\n    <div${options.css ? ' className={styles.container}' : ''}>\n      <h1>${name} Page</h1>\n    </div>\n  );\n};\n\nexport default ${name};\n`;
}

function generateTestContent(name: string, useTS: boolean): string {
  return useTS
    ? `import { render, screen } from '@testing-library/react';\nimport ${name} from './${name}';\n\ndescribe('${name}', () => {\n  it('renders', () => {\n    render(<${name} />);\n    expect(screen.getByText('${name} Page')).toBeInTheDocument();\n  });\n});\n`
    : `import { render, screen } from '@testing-library/react';\nimport ${name} from './${name}';\n\ntest('renders ${name}', () => {\n  render(<${name} />);\n  expect(screen.getByText('${name} Page')).toBeInTheDocument();\n});\n`;
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
    options.layout && 'layout file'
  ].filter(Boolean).join(', ');

  return `Create a ${name} page in ${useTS ? 'TypeScript' : 'JavaScript'} with: ${features}`;
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
    .option('-i, --interactive', 'Use interactive mode')
    .option('--ai', 'Use AI to generate the page code')
    .action(async (name: string | undefined, folder: string | undefined, options: PageOptions) => {
      try {
        console.log(chalk.cyan('\n📄 Page Generator'));
        console.log(chalk.dim('======================'));

        const config = await setupConfiguration(rl);
        const useTS = options.useTS ?? config.typescript;

        // Handle page name
        const pageName = await handleInteractiveName(
          rl,
          name,
          'page',
          {
            pattern: /^[A-Z][a-zA-Z0-9]*$/,
            patternError: "❌ Page name must be PascalCase and start with a capital letter"
          },
         );

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
              key: 'ai',
              question: 'Use AI to generate code? (y/n): ',
              condition: config.aiEnabled,
              handler: async (answer: string) => {
                if (answer.toLowerCase() === 'y') {
                  options.aiFeatures = await askQuestion(
                    rl,
                    chalk.blue('Describe page features (e.g., "data fetching, forms"): ')
                  );
                }
              }
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

        // Create custom config with target directory
        const customConfig = { ...config, baseDir: targetDir, typescript: useTS };
        options.rl = rl; // Pass readline interface to options
        await createPage(pageName, options, customConfig);
      } catch (error) {
        console.error(chalk.red('❌ Error generating page:'), error instanceof Error ? error.message : error);
      } finally {
        rl.close();
      }
    });
}