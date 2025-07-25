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

interface ComponentOptions extends GenerateOptions {
  css?: boolean;
  test?: boolean;
  replace?: boolean;
  useAI?: boolean;
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
  aiPrompt?: string;
}

export function registerGenerateComponent(generate: Command, rl: ReadlineInterface) {
  generate
    .command('component [name] [folder]')
    .description('Generate a new React component')
    .option('--css', 'Include CSS module')
    .option('--test', 'Include test file')
    .option('--replace', 'Replace existing files')
    .option('--ai', 'Use AI to generate code')
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
          await handleInteractiveOptions(rl, options, config);
        }

        const componentFolder = path.join(targetDir, componentName);
        const filesToGenerate = getFilesToGenerate(componentName, options, useTS);

        // Generate all files in a loop
        for (const file of filesToGenerate) {
          await createGeneratedFile({
            rl,
            config,
            type: file.type as GeneratorType,
            name: file.name,
            targetDir: componentFolder,
            useTS: file.useTS,
            replace: options.replace ?? false,
            defaultContent: file.content,
            aiOptions: options.useAI ? {
              features: options.aiFeatures,
              additionalPrompt: file.aiPrompt
            } : undefined
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

async function handleInteractiveOptions(rl: ReadlineInterface, options: ComponentOptions, config: CLIConfig) {
  const questions = [
    {
      key: 'stylingMethod',
      question: 'Choose styling method (css/styled/none): ',
      handler: (answer: string) => {
        options.css = answer === 'css';
        options.styled = answer === 'styled';
      }
    },
    {
      key: 'test',
      question: 'Include test file? (y/n): ',
      handler: (answer: string) => options.test = answer.toLowerCase() === 'y'
    },
    {
      key: 'memo',
      question: 'Optimize with React.memo? (y/n): ',
      handler: (answer: string) => options.memo = answer.toLowerCase() === 'y'
    },
    {
      key: 'forwardRef',
      question: 'Add forwardRef support? (y/n): ',
      handler: (answer: string) => options.forwardRef = answer.toLowerCase() === 'y'
    },
    {
      key: 'exportType',
      question: 'Export type (default/named): ',
      handler: (answer: string) => options.exportType = answer.toLowerCase() === 'named' ? 'named' : 'default'
    },
    {
      key: 'ai',
      question: 'Use AI to generate code? (y/n): ',
      condition: config.aiEnabled,
      handler: async (answer: string) => {
        options.useAI = answer.toLowerCase() === 'y';
        if (options.useAI) {
          options.aiFeatures = await askQuestion(
            rl,
            chalk.blue('Describe component features (e.g., "dark mode, responsive"): ')
          );
        }
      }
    },
    {
      key: 'replace',
      question: 'Replace existing files if they exist? (y/n): ',
      handler: (answer: string) => options.replace = answer.toLowerCase() === 'y'
    }
  ];

  for (const { question, handler, condition } of questions) {
    if (condition !== false) { // Skip only if explicitly false
      const answer = await askQuestion(rl, chalk.blue(question));
      await handler(answer);
    }
  }
}

function getFilesToGenerate(name: string, options: ComponentOptions, useTS: boolean): FileToGenerate[] {
  const files: FileToGenerate[] = [];

  // Main component file
  files.push({
    type: 'component',
    name,
    content: generateComponentContent(name, options, useTS),
    useTS,
    aiPrompt: generateAIPrompt(name, options, useTS)
  });

  // CSS module
  if (options.css) {
    files.push({
      type: 'css',
      name: `${name}.module`,
      content: `.container {\n  /* Styles for ${name} */\n}`,
      useTS: false
    });
  }

  // Styled components
  if (options.styled) {
    files.push({
      type: 'styled',
      name: `${name}.styles`,
      content: `import styled from 'styled-components';\n\nexport const Container = styled.div\`\n  /* Styles for ${name} */\n\`;\n`,
      useTS: false
    });
  }

  // Test file
  if (options.test) {
    files.push({
      type: 'test',
      name: `${name}.test`,
      content: generateTestContent(name, useTS, options.exportType),
      useTS
    });
  }

  return files;
}

function generateComponentContent(name: string, options: ComponentOptions, useTS: boolean): string {
  const imports = ['React'];
  const propsInterface = useTS ? `interface ${name}Props {\n  // define props here\n}` : '';
  let componentBody = '';

  // Add necessary imports
  if (options.css) imports.push(`styles from './${name}.module.css'`);
  if (options.styled) imports.push('styled from "styled-components"');
  if (options.memo) imports.push('memo');
  if (options.forwardRef) imports.push('forwardRef');

  // Create container element
  const container = options.styled 
    ? '<Container>' 
    : `<div${options.css ? ' className={styles.container}' : ''}>`;
  const closing = options.styled ? '</Container>' : '</div>';

  // Component body with forwardRef or regular
  componentBody = options.forwardRef
    ? useTS
      ? `const ${name}Component = forwardRef<HTMLDivElement, ${name}Props>((props, ref) => {\n  return (\n    ${container} ref={ref}>\n      {/* ${name} content */}\n    ${closing}\n  );\n});`
      : `const ${name}Component = forwardRef((props, ref) => {\n  return (\n    ${container} ref={ref}>\n      {/* ${name} content */}\n    ${closing}\n  );\n});`
    : `const ${name}Component = (props) => {\n  return (\n    ${container}\n      {/* ${name} content */}\n    ${closing}\n  );\n}`;

  // Apply memo if needed
  componentBody += options.memo 
    ? `\nconst ${name} = memo(${name}Component);` 
    : `\nconst ${name} = ${name}Component;`;

  // Handle lazy loading
  if (options.lazy) {
    imports.push('lazy from "react"');
    return `${imports.join(', ')};\n\n${propsInterface}\n\n${
      options.exportType === 'named'
        ? `const ${name} = lazy(() => import('./${name}'));\n\nexport { ${name} };`
        : `export default lazy(() => import('./${name}'));`
    }`;
  }

  // Regular export
  const exportStatement = options.exportType === 'named' 
    ? `export { ${name} }` 
    : `export default ${name}`;

  return `${imports.join(', ')};\n\n${propsInterface}\n\n${componentBody}\n\n${exportStatement};`;
}

function generateTestContent(name: string, useTS: boolean, exportType?: 'default' | 'named'): string {
  const importStatement = exportType === 'named'
    ? `import { ${name} } from './${name}';`
    : `import ${name} from './${name}';`;

  return `import React from 'react';\nimport { render } from '@testing-library/react';\n${importStatement}\n\ndescribe('${name}', () => {\n  it('renders without crashing', () => {\n    render(<${name} />);\n  });\n});`;
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

  return `Create a React component named ${name} in ${useTS ? 'TypeScript' : 'JavaScript'} with:\n- ${features}${
    options.aiFeatures ? `\nAdditional features: ${options.aiFeatures}` : ''
  }`;
}