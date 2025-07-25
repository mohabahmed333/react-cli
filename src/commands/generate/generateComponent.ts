import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { createFile } from '../../utils/file';
import { generateComponentWithAI, confirmAIOutput, getAIFeatures, GenerateOptions } from '../../utils/generateAIHelper';
import type { CLIConfig } from '../../utils/config';
import { Interface as ReadlineInterface } from 'readline';
import { setupConfiguration } from '../../utils/config';

interface ComponentOptions extends GenerateOptions {
  css?: boolean;
  test?: boolean;
  replace?: boolean;
  useAI?: boolean;
  aiFeatures?: string;
}

export function registerGenerateComponent(generate: Command, rl: ReadlineInterface) {
  generate
    .command('component [name] [folder]')
    .description('Generate a new React component')
    .option('--css', 'Include CSS module')
    .option('--test', 'Include test file')
    .option('--replace', 'Replace existing files')
    .option('--ai', 'Use AI to generate code')
    .action(async (name: string | undefined, folder: string | undefined, options: ComponentOptions) => {
      try {
        if (!name) {
          console.log(chalk.red('❌ Component name is required'));
          return;
        }

        const config = await setupConfiguration(rl);
        await createComponentInPath(name, folder || 'components', config.typescript, options, config);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(chalk.red('Error:'), error.message);
        } else {
          console.error(chalk.red('Error:'), String(error));
        }
      }
    });
}

async function createComponentInPath(
  componentName: string, 
  fullPath: string, 
  useTS: boolean, 
  options: ComponentOptions,
  config?: CLIConfig
) {
  try {
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(chalk.green(`📁 Created directory: ${fullPath}`));
    }

    const ext = useTS ? 'tsx' : 'jsx';
    const componentFolder = path.join(fullPath, componentName);
    if (!fs.existsSync(componentFolder)) {
      fs.mkdirSync(componentFolder);
    }

    const componentFile = path.join(componentFolder, `${componentName}.${ext}`);
    const cssFile = path.join(componentFolder, `${componentName}.module.css`);
    const testFile = path.join(componentFolder, `${componentName}.test.${ext}`);

    let componentContent = '';
    if (options.useAI && config) {
      const aiContent = await generateComponentWithAI(componentName, config, {
        features: options.aiFeatures
      });

      if (aiContent && (!fs.existsSync(componentFile) || options.replace)) {
        if (options.rl && await confirmAIOutput(options.rl, aiContent)) {
          componentContent = aiContent;
        }
      }
    }

    if (!componentContent) {
      const cssImport = options.css ? `\nimport styles from './${componentName}.module.css';` : '';
      componentContent = useTS
        ? `import React from 'react';${cssImport}\n\ninterface ${componentName}Props {\n  // define props here\n}\n\nconst ${componentName}: React.FC<${componentName}Props> = (props) => {\n  return (\n    <div${options.css ? ' className={styles.container}' : ''}>\n      {/* ${componentName} component */}\n    </div>\n  );\n};\n\nexport default ${componentName};\n`
        : `import React from 'react';${cssImport}\n\nconst ${componentName} = (props) => {\n  return (\n    <div${options.css ? ' className={styles.container}' : ''}>\n      {/* ${componentName} component */}\n    </div>\n  );\n};\n\nexport default ${componentName};\n`;
    }

    if (createFile(componentFile, componentContent, options.replace)) {
      console.log(chalk.green(`✅ Created component: ${componentFile}`));
    } else {
      console.log(chalk.yellow(`⚠️ Component exists: ${componentFile} (use --replace to overwrite)`));
    }

    if (options.css) {
      const cssContent = `.container {\n  /* Styles for ${componentName} */\n}`;
      if (createFile(cssFile, cssContent, options.replace)) {
        console.log(chalk.green(`✅ Created CSS module: ${cssFile}`));
      } else {
        console.log(chalk.yellow(`⚠️ CSS module exists: ${cssFile} (use --replace to overwrite)`));
      }
    }

    if (options.test) {
      const testContent = useTS
        ? `import React from 'react';\nimport { render } from '@testing-library/react';\nimport ${componentName} from './${componentName}';\n\ntest('renders ${componentName} component', () => {\n  render(<${componentName} />);\n});\n`
        : `import React from 'react';\nimport { render } from '@testing-library/react';\nimport ${componentName} from './${componentName}';\n\ntest('renders ${componentName} component', () => {\n  render(<${componentName} />);\n});\n`;
      if (createFile(testFile, testContent, options.replace)) {
        console.log(chalk.green(`✅ Created test file: ${testFile}`));
      } else {
        console.log(chalk.yellow(`⚠️ Test file exists: ${testFile} (use --replace to overwrite)`));
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(chalk.red('Error:'), error.message);
      if ('code' in error) {
        const fsError = error as { code: string };
        if (fsError.code === 'ENOENT') {
          console.log(chalk.yellow('💡 Check that parent directories exist and are writable'));
        } else if (fsError.code === 'EACCES') {
          console.log(chalk.yellow('💡 You might need permission to write to this directory'));
        }
      }
    } else {
      console.error(chalk.red('Error:'), String(error));
    }
  }
} 