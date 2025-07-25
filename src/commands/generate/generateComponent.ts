import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { setupConfiguration } from '../../utils/config';
import { askQuestion } from '../../utils/prompt';
import { createFile, createFolder } from '../../utils/file';
import { 
  shouldUseAI, 
  generateComponentWithAI, 
  getAIFeatures, 
  confirmAIOutput 
} from '../../utils/generateAIHelper';

function findFoldersByName(baseDir: string, folderName: string): string[] {
  const results: string[] = [];
  function search(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (entry.name.toLowerCase() === folderName.toLowerCase()) {
          results.push(path.join(dir, entry.name));
        }
        search(path.join(dir, entry.name));
      }
    }
  }
  search(baseDir);
  return results;
}

export function registerGenerateComponent(generate: Command, rl: any) {
  generate
    .command('component [name] [folder]')
    .description('Generate a functional React component (optionally in a specific folder under app/)')
    .option('--ts', 'Generate as TypeScript (.tsx)')
    .option('--css', 'Generate a CSS module alongside the component')
    .option('--test', 'Generate a test file for the component')
    .option('--replace', 'Replace file if it exists')
    .option('-i, --interactive', 'Use interactive mode for component and folder selection')
    .option('--ai', 'Use AI to generate the component code')
    .action(async (name: string | undefined, folder: string | undefined, options: any) => {
      try {
        const config = await setupConfiguration(rl);
        const useTS = options.ts ?? config.typescript;
        let componentName = name;
        let targetDir: string | undefined = undefined;
        let useAI = false;
        let aiFeatures = '';

        if (options.interactive) {
          console.log(chalk.cyan('\n🎨 Component Generator'));
          console.log(chalk.dim('======================'));

          // 1. Prompt for component name
          componentName = (await askQuestion(rl, chalk.blue('Enter component name (PascalCase): '))) || '';
          if (!/^[A-Z][a-zA-Z0-9]*$/.test(componentName)) {
            console.log(chalk.red('❌ Component name must be PascalCase and start with a capital letter'));
            return;
          }

          // 2. Ask about AI usage if enabled
          if (config.aiEnabled) {
            useAI = await shouldUseAI(rl, options, config);
            if (useAI) {
              aiFeatures = await getAIFeatures(rl, 'Component');
            }
          }

          // 3. Ask if user wants to add to a specific folder
          const useFolder = await askQuestion(rl, chalk.blue('Add to a specific folder under app/? (y/n): '));
          if (useFolder.toLowerCase() === 'y') {
            // 4. Prompt for folder name
            const folderName = await askQuestion(rl, chalk.blue('Enter folder name: '));
            if (!folderName) {
              console.log(chalk.red('❌ Folder name required.'));
              return;
            }
            if (folderName.includes('/') || folderName.includes('\\')) {
              targetDir = path.join(config.baseDir, folderName);
            } else {
              const baseSearch = path.join(process.cwd(), 'app');
              const matches = findFoldersByName(baseSearch, folderName);
              if (matches.length === 0) {
                const createNew = await askQuestion(rl, chalk.yellow(`No folder named "${folderName}" found under app/. Create it? (y/n): `));
                if (createNew.toLowerCase() !== 'y') {
                  console.log(chalk.yellow('⏩ Component creation cancelled'));
                  return;
                }
                targetDir = path.join(baseSearch, folderName);
                fs.mkdirSync(targetDir, { recursive: true });
                console.log(chalk.green(`📁 Created directory: ${targetDir}`));
              } else if (matches.length === 1) {
                targetDir = matches[0];
              } else {
                let chosen = matches[0];
                console.log(chalk.yellow('Multiple folders found:'));
                matches.forEach((m, i) => console.log(`${i + 1}: ${m}`));
                const idx = await askQuestion(rl, chalk.blue('Select folder number: '));
                const num = parseInt(idx, 10);
                if (!isNaN(num) && num >= 1 && num <= matches.length) {
                  chosen = matches[num - 1];
                } else {
                  console.log(chalk.red('Invalid selection. Component creation cancelled.'));
                  return;
                }
                targetDir = chosen;
              }
            }
          } else {
            targetDir = path.join(config.baseDir, 'components');
          }

          // 5. Ask about additional options if not using AI
          if (!useAI) {
            options.css = (await askQuestion(rl, chalk.blue('Generate CSS module? (y/n): '))) === 'y';
            options.test = (await askQuestion(rl, chalk.blue('Generate test file? (y/n): '))) === 'y';
          }

          await createComponentInPath(componentName, targetDir, useTS, { ...options, useAI, aiFeatures, rl }, config);
          return;
        }

        // Non-interactive mode
        if (!componentName) {
          console.log(chalk.red('❌ Component name is required.'));
          return;
        }
        if (!/^[A-Z][a-zA-Z0-9]*$/.test(componentName)) {
          console.log(chalk.red('❌ Component name must be PascalCase and start with a capital letter'));
          return;
        }

        useAI = await shouldUseAI(rl, options, config);

        if (folder) {
          if (folder.includes('/') || folder.includes('\\')) {
            targetDir = path.join(config.baseDir, folder);
          } else {
            const baseSearch = path.join(process.cwd(), 'app');
            const matches = findFoldersByName(baseSearch, folder);
            if (matches.length === 0) {
              console.log(chalk.red(`❌ No folder named "${folder}" found under app/. Use -i to create interactively.`));
              return;
            } else if (matches.length === 1) {
              targetDir = matches[0];
            } else {
              targetDir = matches[0]; // Default to first match
            }
          }
        } else {
          targetDir = path.join(config.baseDir, 'components');
        }

        await createComponentInPath(componentName, targetDir, useTS, { ...options, useAI, rl }, config);
      } catch (error) {
        console.error(chalk.red('\n❌ Error:'), error instanceof Error ? error.message : 'Unknown error');
      } finally {
        rl.close();
      }
    });
}

async function createComponentInPath(
  componentName: string, 
  fullPath: string, 
  useTS: boolean, 
  options: any,
  config?: any
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
        if (await confirmAIOutput(options.rl, aiContent)) {
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
  } catch (error: any) {
    console.log(chalk.red(`❌ Error creating component:`));
    console.error(chalk.red(error.message));
    if (error.code === 'ENOENT') {
      console.log(chalk.yellow('💡 Check that parent directories exist and are writable'));
    } else if (error.code === 'EACCES') {
      console.log(chalk.yellow('💡 You might need permission to write to this directory'));
    }
  }
} 