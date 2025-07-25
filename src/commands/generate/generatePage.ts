import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { CLIConfig, setupConfiguration } from '../../utils/config';
import { askQuestion } from '../../utils/prompt';
import { createFile, createFolder } from '../../utils/file';
import {
  shouldUseAI,
  generatePageWithAI,
  getAIFeatures,
  confirmAIOutput,
  GenerateOptions
} from '../../utils/generateAIHelper';
import { Interface as ReadlineInterface } from 'readline';

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

async function createPage(name: string, options: GenerateOptions, config: CLIConfig) {
  const ext = config.typescript ? 'tsx' : 'jsx';
  const basePath = config.projectType === 'next'
    ? `${config.baseDir}/pages/${config.localization ? '[lang]/' : ''}${name}`
    : `${config.baseDir}/pages/${name}`;
  if (options.hooks) {
    const hookContent = config.typescript
      ? `import { useState } from 'react';\n\nexport const use${name} = (): [boolean, () => void] => {\n  const [state, setState] = useState(false);\n  const toggle = () => setState(!state);\n  return [state, toggle];\n};\n`
      : `import { useState } from 'react';\n\nexport const use${name} = () => {\n  const [state, setState] = useState(false);\n  const toggle = () => setState(!state);\n  return [state, toggle];\n};\n`;
    createFile(`${config.baseDir}/hooks/use${name}.${config.typescript ? 'ts' : 'js'}`, hookContent);
  }
  if (options.utils) {
    const utilContent = config.typescript
      ? `export const format${name} = (input: string): string => {\n  return input.toUpperCase();\n};\n`
      : `export const format${name} = (input) => {\n  return input.toUpperCase();\n};\n`;
    createFile(`${config.baseDir}/utils/${name}Utils.${config.typescript ? 'ts' : 'js'}`, utilContent);
  }
  if (options.types && config.typescript) {
    const typeContent = `export interface ${name}Props {\n  // Add props here\n}\n\nexport type ${name}Type = {\n  id: string;\n  name: string;\n};\n`;
    createFile(`${config.baseDir}/types/${name}.types.ts`, typeContent);
  }
  createFolder(basePath);

  // Create necessary folders
  createFolder(basePath);
  if (options.components) {
    createFolder(`${basePath}/components`);
  }
  if (options.lib) {
    createFolder(`${basePath}/lib`);
  }

  // Generate page content
  let pageContent = '';
  if (options.useAI && config) {
    const aiContent = await generatePageWithAI(name, config, {
      features: options.aiFeatures,
      css: options.css,
      components: options.components,
      lib: options.lib
    });

    if (aiContent && (!fs.existsSync(`${basePath}/${name}.${ext}`) || options.replace)) {
      if (options.rl && await confirmAIOutput(options.rl, aiContent)) {
        pageContent = aiContent;
      }
    }
  }

  if (!pageContent) {
    pageContent = config.typescript
      ? `import React from 'react';\n${options.css ? `import styles from './${name}.module.css';\n` : ''}\ninterface ${name}Props {}\n\nconst ${name}: React.FC<${name}Props> = () => {\n  return (\n    <div${options.css ? ' className={styles.container}' : ''}>\n      <h1>${name} Page</h1>\n    </div>\n  );\n};\n\nexport default ${name};\n`
      : `import React from 'react';\n${options.css ? `import styles from './${name}.module.css';\n` : ''}\nconst ${name} = () => {\n  return (\n    <div${options.css ? ' className={styles.container}' : ''}>\n      <h1>${name} Page</h1>\n    </div>\n  );\n};\n\nexport default ${name};\n`;
  }

  // Create files
  if (createFile(`${basePath}/${name}.${ext}`, pageContent, options.replace)) {
    console.log(chalk.green(`✅ Created page: ${basePath}/${name}.${ext}`));
  } else {
    console.log(chalk.yellow(`⚠️ Page exists: ${basePath}/${name}.${ext} (use --replace to overwrite)`));
  }

  // Create additional files
  if (options.css) {
    createFile(`${basePath}/${name}.module.css`, `.container {\n  padding: 20px;\n}\n`);
  }
  if (options.test) {
    const testContent = config.typescript
      ? `import { render, screen } from '@testing-library/react';\nimport ${name} from './${name}';\n\ndescribe('${name}', () => {\n  it('renders', () => {\n    render(<${name} />);\n    expect(screen.getByText('${name} Page')).toBeInTheDocument();\n  });\n});\n`
      : `import { render, screen } from '@testing-library/react';\nimport ${name} from './${name}';\n\ntest('renders ${name}', () => {\n  render(<${name} />);\n  expect(screen.getByText('${name} Page')).toBeInTheDocument();\n});\n`;
    createFile(`${basePath}/${name}.test.${ext}`, testContent);
  }
  if (options.components) {
    createFolder(`${basePath}/components`);
  }
  if (options.lib) {
    createFolder(`${basePath}/lib`);
    createFile(`${basePath}/lib/constants.${config.typescript ? 'ts' : 'js'}`,
      config.typescript
        ? `export const ${name.toUpperCase()}_CONSTANT: string = 'value';\n`
        : `export const ${name.toUpperCase()}_CONSTANT = 'value';\n`);
  }
  if (options.layout && config.projectType === 'next') {
    const layoutContent = config.typescript
      ? `import { ReactNode } from 'react';\n\nexport default function Layout({ children }: { children: ReactNode }) {\n  return (\n    <div>\n      <main>{children}</main>\n    </div>\n  );\n}\n`
      : `export default function Layout({ children }) {\n  return (\n    <div>\n      <main>{children}</main>\n    </div>\n  );\n}\n`;
    createFile(`${basePath}/layout.${ext}`, layoutContent);
  }
  console.log(chalk.green.bold(`\n 389 Created ${name} page at ${basePath}`));
}

export function registerGeneratePage(generate: Command, rl: ReadlineInterface) {
  generate
    .command('page [name] [folder]')
    .description('Generate a page with components (optionally in a specific folder under app/)')
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
    .option('-i, --interactive', 'Use interactive mode for page and folder selection')
    .option('--ai', 'Use AI to generate the page code')
    .action(async (name: string | undefined, folder: string | undefined, options: GenerateOptions) => {
      try {
        console.log(chalk.cyan('\n📄 Page Generator'));
        console.log(chalk.dim('======================'));

        const config = await setupConfiguration(rl);
        let pageName = name;
        let targetDir: string | undefined = undefined;
        let useAI = false;
        let aiFeatures = '';

        if (options.interactive) {
          // 1. Prompt for page name
          pageName = (await askQuestion(rl, chalk.blue('Enter page name (PascalCase): '))) || '';
          if (!/^[A-Z][a-zA-Z0-9]*$/.test(pageName)) {
            console.log(chalk.red('❌ Page name must be PascalCase and start with a capital letter'));
            return;
          }

          // Ask about AI usage if enabled
          if (config.aiEnabled) {
            useAI = await shouldUseAI(rl, options, config);
            if (useAI) {
              console.log(chalk.cyan('\n📝 Page Configuration'));
              options.css = (await askQuestion(rl, chalk.blue('Include CSS module? (y/n): '))) === 'y';
              options.components = (await askQuestion(rl, chalk.blue('Include components folder? (y/n): '))) === 'y';
              options.lib = (await askQuestion(rl, chalk.blue('Include lib utilities? (y/n): '))) === 'y';

              console.log(chalk.cyan('\nDescribe additional features (e.g., "data fetching, form handling, authentication"):'));
              aiFeatures = await getAIFeatures(rl, 'Page');
            }
          }

          // 2. Ask if user wants to add to a specific folder
          const useFolder = await askQuestion(rl, chalk.blue('Add to a specific folder under app/? (y/n): '));
          if (useFolder.toLowerCase() === 'y') {
            // 3. Prompt for folder name
            const folderName = await askQuestion(rl, chalk.blue('Enter folder name: '));
            if (!folderName) {
              console.log(chalk.red('❌ Folder name required.'));
              rl.close();
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
                  console.log(chalk.yellow('⏩ Page creation cancelled'));
                  rl.close();
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
                  console.log(chalk.red('Invalid selection. Page creation cancelled.'));
                  rl.close();
                  return;
                }
                targetDir = chosen;
              }
            }
          } else {
            targetDir = path.join(config.baseDir, 'pages');
          }
          // Use the same options as before, but override the base path
          const customConfig = { ...config };
          customConfig.baseDir = targetDir;
          await createPage(pageName, options, customConfig);
          rl.close();
          return;
        }
        // Non-interactive mode (legacy)
        if (!pageName) {
          console.log(chalk.red('❌ Page name is required.'));
          rl.close();
          return;
        }
        if (!/^[A-Z][a-zA-Z0-9]*$/.test(pageName)) {
          console.log(chalk.red('❌ Page name must be PascalCase and start with a capital letter'));
          rl.close();
          return;
        }
        if (folder) {
          if (folder.includes('/') || folder.includes('\\')) {
            targetDir = path.join(config.baseDir, folder);
          } else {
            const baseSearch = path.join(process.cwd(), 'app');
            const matches = findFoldersByName(baseSearch, folder);
            if (matches.length === 0) {
              console.log(chalk.red(`❌ No folder named "${folder}" found under app/. Use -i to create interactively.`));
              rl.close();
              return;
            } else if (matches.length === 1) {
              targetDir = matches[0];
            } else {
              targetDir = matches[0]; // Default to first match
            }
          }
          const customConfig = { ...config };
          customConfig.baseDir = targetDir;
          await createPage(pageName, options, customConfig);
        } else {
          await createPage(pageName, options, config);
        }
        rl.close();
      } catch (error) {
        console.error(chalk.red('❌ Error generating page:'), error);
        rl.close();
      }
    });
} 