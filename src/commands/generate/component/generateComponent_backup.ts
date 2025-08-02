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
import { handleGeneratorOptions, COMPONENT_OPTIONS_CONFIG } from '../../../utils/shared/generatorOptions';
import { GeneratorType } from '../../../types/generator-type';
import { generateComponentContent, generateCSSContent, generateStyledComponentsContent, generateTestContent } from '../../../content';
 

export interface ComponentOptions extends GenerateOptions {
  css?: boolean;
  test?: boolean;
  replace?: boolean;
  aiFeatures?: string;
  lazy?: boolean;
  memo?: boolean;
  forwardRef?: boolean;
  styled?: boolean;
  exportType?: 'default' | 'named';
  jsx?: boolean;
}

interface FileToGenerate {
  type: string;
  name: string;
  content: string;
  useTS: boolean;
  aiOptions?: {
    features?: string;
    additionalPrompt?: string;
  };
}

export function registerGenerateComponent(generate: Command, rl: ReadlineInterface) {
  generate
    .command('component [name] [folder]')
    .description('Generate a new React component')
    .option('--css', 'Include CSS module')
    .option('--test', 'Include test file')
    .option('--replace', 'Replace existing files')
    .option('--lazy', 'Generate lazy-loaded component')
    .option('--memo', 'Wrap with React.memo')
    .option('--forward-ref', 'Add forwardRef support')
    .option('--styled', 'Use styled-components instead of CSS modules')
    .option('--named-export', 'Use named export instead of default')
    .option('--jsx', 'Force JSX extension even for TS')
    .option('-i, --interactive', 'Use interactive mode for component generation')
    .action(async (name: string | undefined, folder: string | undefined, options: ComponentOptions) => {
      try {
        const config = await setupConfiguration(rl);
        const useTS = config.typescript && !options.jsx;

        // Handle component name
        const componentName = await handleInteractiveName(
          rl,
          name,
          'component',
          {
            pattern: /^[A-Z][a-zA-Z0-9]*$/,
            patternError: "❌ Component name must be PascalCase and start with a capital letter"
          }
        );

        // Handle target directory
        const targetDir = await handleTargetDirectory(
          rl,
          config,
          folder,
          'components',
          options.interactive ?? false
        );

        // Handle interactive options
        if (options.interactive) {
          const interactiveResult = await handleGeneratorOptions(
            rl,
            config,
            useTS,
            COMPONENT_OPTIONS_CONFIG
          );

          // Apply AI options - set aiFeatures if AI was chosen
          if (interactiveResult.useAI && interactiveResult.aiFeatures) {
            options.aiFeatures = interactiveResult.aiFeatures;
          }

          // Apply styling options
          if (interactiveResult.styling) {
            options.css = interactiveResult.styling === 'css';
            options.styled = interactiveResult.styling === 'styled';
          }

          // Apply additional file options
          options.test = interactiveResult.additionalFiles.test;

          // Ask for component-specific options
          const memoChoice = await askQuestion(rl, chalk.blue('Optimize with React.memo? (y/n): '));
          options.memo = memoChoice.toLowerCase() === 'y';

          const forwardRefChoice = await askQuestion(rl, chalk.blue('Add forwardRef support? (y/n): '));
          options.forwardRef = forwardRefChoice.toLowerCase() === 'y';

          const exportChoice = await askQuestion(rl, chalk.blue('Export type (default/named): '));
          options.exportType = exportChoice.toLowerCase() === 'named' ? 'named' : 'default';

          const replaceChoice = await askQuestion(rl, chalk.blue('Replace existing files if they exist? (y/n): '));
          options.replace = replaceChoice.toLowerCase() === 'y';
        } else {
          // Handle --ai flag when not in interactive mode
          if (options.ai) {
            // Set a special marker to indicate AI was requested
            options.aiFeatures = 'AI_REQUESTED';
          }
        }

        const componentFolder = path.join(targetDir, componentName);
        const filesToGenerate = await getFilesToGenerate(componentName, options, useTS, config);

        // Generate all files in a loop
        for (const file of filesToGenerate) {
          await createGeneratedFile({
            rl: rl,
            config,
            type: file.type as GeneratorType,
            name: file.name,
            targetDir: componentFolder,
            useTS: file.useTS,
            replace: options.replace ?? false,
            defaultContent: file.content,
            aiOptions: file.aiOptions
          });
        }

        console.log(chalk.green(`✅ Successfully generated ${componentName} component`));
      } catch (error) {
        console.error(chalk.red('❌ Error generating component:'), error instanceof Error ? error.message : error);
      } finally {
        rl.close();
      }
    });
}



async function getFilesToGenerate(name: string, options: ComponentOptions, useTS: boolean, config: CLIConfig): Promise<FileToGenerate[]> {
  const files: FileToGenerate[] = [];

  // Main component file - let createGeneratedFile handle AI generation
  files.push({
    type: 'component',
    name,
    content: generateComponentContent(name, options, useTS),
    useTS,
    aiOptions: {
      features: options.aiFeatures || '', // Pass features if provided, empty string if not
      additionalPrompt: generateAIPrompt(name, options, useTS)
    }
  });

  // CSS module
  if (options.css) {
    files.push({
      type: 'css',
      name: `${name}.module`,
      content: generateCSSContent(name),
      useTS: false
      // No aiOptions for CSS files
    });
  }

  // Styled components
  if (options.styled) {
    files.push({
      type: 'styled',
      name: `${name}.styles`,
      content: generateStyledComponentsContent(name),
      useTS: false
      // No aiOptions for styled files
    });
  }

  // Test file
  if (options.test) {
    files.push({
      type: 'test',
      name: `${name}.test`,
      content: generateTestContent(name, useTS, options.exportType),
      useTS
      // No aiOptions for test files
    });
  }

  return files;
}




function generateAIPrompt(name: string, options: ComponentOptions, useTS: boolean): string {
  const features = [
    options.css && 'CSS modules',
    options.styled && 'styled-components',
    options.memo && 'React.memo optimization',
    options.forwardRef && 'forwardRef support',
    options.exportType === 'named' && 'Named export',
    options.lazy && 'Lazy loading support'
  ].filter(Boolean).join('\n- ');

  return `Create a React component named ${name} in ${useTS ? 'TypeScript' : 'JavaScript'} with:\n- ${features}${options.aiFeatures ? `\nAdditional features: ${options.aiFeatures}` : ''
    }`;
}