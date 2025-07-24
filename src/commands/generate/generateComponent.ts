import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { setupConfiguration } from '../../utils/config';
import { askQuestion } from '../../utils/prompt';
import { createFile, createFolder } from '../../utils/file';

export function registerGenerateComponent(generate: Command, rl: any) {
  generate
    .command('component <name>')
    .description('Generate a functional React component (global or per-page)')
    .option('--ts', 'Generate as TypeScript (.tsx)')
    .option('--css', 'Generate a CSS module alongside the component')
    .option('--test', 'Generate a test file for the component')
    .option('--replace', 'Replace file if it exists')
    .option('--page <page>', 'Target page directory (e.g., page)')
    .option('--global', 'Place the component in the global app/components directory')
    .option('-i, --interactive', 'Use interactive mode')
    .action(async (name: string, options: any) => {
      const config = await setupConfiguration(rl);
      const useTS = options.ts ?? config.typescript;
      let page = options.page;
      let useGlobal = options.global;
      if (options.interactive) {
        if (!page && !useGlobal) {
          const location = await askQuestion(rl, chalk.blue('Add to (g)lobal components or (p)age? (g/p): '));
          useGlobal = location === 'g';
          if (!useGlobal) {
            page = await askQuestion(rl, chalk.blue('Enter page name: '));
            if (!page) {
              console.log(chalk.red('Page name is required if not using global.'));
              rl.close();
              return;
            }
          }
        }
      }
      let baseDir;
      if (useGlobal || (!page && !useGlobal)) {
        baseDir = path.join('app', 'components');
      } else {
        baseDir = path.join('app', 'pages', page, 'components');
      }
      createFolder(baseDir);
      const componentFolder = path.join(baseDir, name);
      createFolder(componentFolder);
      const ext = useTS ? 'tsx' : 'jsx';
      const componentFile = path.join(componentFolder, `${name}.${ext}`);
      const cssFile = path.join(componentFolder, `${name}.module.css`);
      const testFile = path.join(componentFolder, `${name}.test.${ext}`);
      const cssImport = options.css ? `\nimport styles from './${name}.module.css';` : '';
      const componentContent = useTS
        ? `import React from 'react';${cssImport}\n\ninterface ${name}Props {\n  // define props here\n}\n\nconst ${name}: React.FC<${name}Props> = (props) => {\n  return (\n    <div${options.css ? ' className={styles.container}' : ''}>\n      {/* ${name} component */}\n    </div>\n  );\n};\n\nexport default ${name};\n`
        : `import React from 'react';${cssImport}\n\nconst ${name} = (props) => {\n  return (\n    <div${options.css ? ' className={styles.container}' : ''}>\n      {/* ${name} component */}\n    </div>\n  );\n};\n\nexport default ${name};\n`;
      const cssContent = `.container {\n  /* Styles for ${name} */\n}`;
      const testContent = useTS
        ? `import React from 'react';\nimport { render } from '@testing-library/react';\nimport ${name} from './${name}';\n\ntest('renders ${name} component', () => {\n  render(<${name} />);\n});\n`
        : `import React from 'react';\nimport { render } from '@testing-library/react';\nimport ${name} from './${name}';\n\ntest('renders ${name} component', () => {\n  render(<${name} />);\n});\n`;
      if (createFile(componentFile, componentContent, options.replace)) {
        console.log(chalk.green(`✅ Created component: ${componentFile}`));
      } else {
        console.log(chalk.yellow(`⚠️ Component exists: ${componentFile} (use --replace to overwrite)`));
      }
      if (options.css) {
        if (createFile(cssFile, cssContent, options.replace)) {
          console.log(chalk.green(`✅ Created CSS module: ${cssFile}`));
        } else {
          console.log(chalk.yellow(`⚠️ CSS module exists: ${cssFile} (use --replace to overwrite)`));
        }
      }
      if (options.test) {
        if (createFile(testFile, testContent, options.replace)) {
          console.log(chalk.green(`✅ Created test file: ${testFile}`));
        } else {
          console.log(chalk.yellow(`⚠️ Test file exists: ${testFile} (use --replace to overwrite)`));
        }
      }
      rl.close();
    });
} 