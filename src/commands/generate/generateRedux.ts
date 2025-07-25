import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { setupConfiguration, CLIConfig } from '../../utils/config';
import { askQuestion } from '../../utils/prompt';
import { createFile, createFolder } from '../../utils/file';
import { 
  shouldUseAI, 
  generateReduxWithAI, 
  getAIFeatures, 
  confirmAIOutput,
  GenerateOptions 
} from '../../utils/generateAIHelper';
import { Interface as ReadlineInterface } from 'readline';
import { findFoldersByName } from '../../utils/file/findFolderByName';

interface ReduxOptions extends GenerateOptions {
  ts?: boolean;
  interactive?: boolean;
  replace?: boolean;
  ai?: boolean;
}

interface ReduxGenerateOptions {
  useAI: boolean;
  config: CLIConfig;
  aiFeatures: string;
  rl?: ReadlineInterface;
}
 
export function registerGenerateRedux(generate: Command, rl: ReadlineInterface) {
  generate
    .command('redux [name] [folder]')
    .description('Generate a Redux slice (optionally in a specific folder under app/)')
    .option('--ts', 'Override TypeScript setting')
    .option('-i, --interactive', 'Use interactive mode for redux and folder selection')
    .option('--replace', 'Replace file if it exists')
    .option('--ai', 'Use AI to generate the Redux slice code')
    .action(async (name: string | undefined, folder: string | undefined, options: ReduxOptions) => {
      try {
        console.log(chalk.cyan('\n📦 Redux Slice Generator'));
        console.log(chalk.dim('======================'));

        const config = await setupConfiguration(rl);
        const useTS = options.ts ?? config.typescript;
        let reduxName = name;
        let targetDir: string | undefined = undefined;
        let useAI = false;
        let aiFeatures = '';

        if (options.interactive) {
          // 1. Prompt for redux slice name
          reduxName = (await askQuestion(rl, chalk.blue('Enter redux slice name (PascalCase): '))) || '';
          if (!/^[A-Z][a-zA-Z0-9]*$/.test(reduxName)) {
            console.log(chalk.red('❌ Redux slice name must be PascalCase and start with a capital letter'));
            return;
          }

          // Ask about AI usage if enabled
          if (config.aiEnabled) {
            useAI = await shouldUseAI(rl, options, config);
            if (useAI) {
              console.log(chalk.cyan('\n📝 Redux Slice Configuration'));
              console.log(chalk.cyan('\nDescribe the state and actions needed (e.g., "user authentication state with login/logout actions"):'));
              aiFeatures = await getAIFeatures(rl, 'Redux');
            }
          }

          // 2. Ask if user wants to add to a specific folder
          const useFolder = await askQuestion(rl, chalk.blue('Add to a specific folder under app/? (y/n): '));
          if (useFolder.toLowerCase() === 'y') {
            // 3. Prompt for folder name
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
                  console.log(chalk.yellow('⏩ Redux slice creation cancelled'));
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
                  console.log(chalk.red('Invalid selection. Redux slice creation cancelled.'));
                  return;
                }
                targetDir = chosen;
              }
            }
          } else {
            targetDir = path.join(config.baseDir, 'store');
          }
          await createReduxInPath(reduxName, targetDir, useTS, options.replace, { useAI, config, aiFeatures, rl });
          return;
        }

        // Non-interactive mode
        if (!reduxName) {
          console.log(chalk.red('❌ Redux slice name is required.'));
          return;
        }
        if (!/^[A-Z][a-zA-Z0-9]*$/.test(reduxName)) {
          console.log(chalk.red('❌ Redux slice name must be PascalCase and start with a capital letter'));
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
              return;
            } else if (matches.length === 1) {
              targetDir = matches[0];
            } else {
              targetDir = matches[0]; // Default to first match
            }
          }
          await createReduxInPath(reduxName, targetDir, useTS, options.replace, { useAI, config, aiFeatures, rl });
        } else {
          targetDir = path.join(config.baseDir, 'store');
          await createReduxInPath(reduxName, targetDir, useTS, options.replace, { useAI, config, aiFeatures, rl });
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(chalk.red(error.message));
        } else {
          console.error(chalk.red('An unknown error occurred'));
        }
      }
    });
}

async function createReduxInPath(
  reduxName: string, 
  fullPath: string, 
  useTS: boolean, 
  replace = false, 
  options: ReduxGenerateOptions
) {
  try {
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(chalk.green(`📁 Created directory: ${fullPath}`));
    }

    const reduxFilePath = path.join(fullPath, `${reduxName}Slice.${useTS ? 'ts' : 'js'}`);
    
    let content = '';
    if (options.useAI && options.config) {
      const aiContent = await generateReduxWithAI(reduxName, options.config, {
        features: options.aiFeatures
      });

      if (aiContent && (!fs.existsSync(reduxFilePath) || replace)) {
        if (options.rl && await confirmAIOutput(options.rl, aiContent)) {
          content = aiContent;
        }
      }
    }

    if (!content) {
      content = useTS
        ? `import { createSlice, PayloadAction } from '@reduxjs/toolkit';\n\ninterface ${reduxName}State {\n  // Add your state properties here\n}\n\nconst initialState: ${reduxName}State = {\n  // ...\n};\n\nconst ${reduxName}Slice = createSlice({\n  name: '${reduxName}',\n  initialState,\n  reducers: {\n    // add reducers here\n  },\n});\n\nexport const { actions, reducer } = ${reduxName}Slice;\n`
        : `import { createSlice } from '@reduxjs/toolkit';\n\nconst initialState = {\n  // ...\n};\n\nconst ${reduxName}Slice = createSlice({\n  name: '${reduxName}',\n  initialState,\n  reducers: {\n    // add reducers here\n  },\n});\n\nexport const { actions, reducer } = ${reduxName}Slice;\n`;
    }

    if (createFile(reduxFilePath, content, replace)) {
      console.log(chalk.green(`✅ Created Redux slice: ${reduxFilePath}`));
    } else {
      console.log(chalk.yellow(`⚠️ Redux slice exists: ${reduxFilePath} (use --replace to overwrite)`));
    }
  } catch (error: unknown) {
    console.log(chalk.red(`❌ Error creating Redux slice:`));
    if (error instanceof Error) {
      console.error(chalk.red(error.message));
      if ('code' in error) {
        const fsError = error as { code: string };
        if (fsError.code === 'ENOENT') {
          console.log(chalk.yellow('💡 Check that parent directories exist and are writable'));
        } else if (fsError.code === 'EACCES') {
          console.log(chalk.yellow('💡 You might need permission to write to this directory'));
        }
      }
    } else {
      console.error(chalk.red(String(error)));
    }
  }
} 