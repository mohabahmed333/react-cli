import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { setupConfiguration } from '../../utils/config';
import { askQuestion } from '../../utils/prompt';
import { createFile, createFolder } from '../../utils/file';

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

export function registerGenerateRedux(generate: Command, rl: any) {
  generate
    .command('redux [name] [folder]')
    .description('Generate a Redux slice (optionally in a specific folder under app/)')
    .option('--ts', 'Override TypeScript setting')
    .option('-i, --interactive', 'Use interactive mode for redux and folder selection')
    .option('--replace', 'Replace file if it exists')
    .action(async (name: string | undefined, folder: string | undefined, options: any) => {
      const config = await setupConfiguration(rl);
      const useTS = options.ts ?? config.typescript;
      let reduxName = name;
      let targetDir: string | undefined = undefined;
      if (options.interactive) {
        // 1. Prompt for redux slice name
        reduxName = (await askQuestion(rl, chalk.blue('Enter redux slice name (PascalCase): '))) || '';
        if (!/^[A-Z][a-zA-Z0-9]*$/.test(reduxName)) {
          console.log(chalk.red('❌ Redux slice name must be PascalCase and start with a capital letter'));
          rl.close();
          return;
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
                console.log(chalk.yellow('⏩ Redux slice creation cancelled'));
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
                console.log(chalk.red('Invalid selection. Redux slice creation cancelled.'));
                rl.close();
                return;
              }
              targetDir = chosen;
            }
          }
        } else {
          targetDir = path.join(config.baseDir, 'store');
        }
        await createReduxInPath(reduxName, targetDir, useTS, options.replace);
        rl.close();
        return;
      }
      // Non-interactive mode (legacy)
      if (!reduxName) {
        console.log(chalk.red('❌ Redux slice name is required.'));
        rl.close();
        return;
      }
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(reduxName)) {
        console.log(chalk.red('❌ Redux slice name must be PascalCase and start with a capital letter'));
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
        await createReduxInPath(reduxName, targetDir, useTS, options.replace);
      } else {
        targetDir = path.join(config.baseDir, 'store');
        await createReduxInPath(reduxName, targetDir, useTS, options.replace);
      }
      rl.close();
    });
}

async function createReduxInPath(reduxName: string, fullPath: string, useTS: boolean, replace = false) {
  try {
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(chalk.green(`📁 Created directory: ${fullPath}`));
    }
    const reduxFilePath = path.join(fullPath, `${reduxName}Slice.${useTS ? 'ts' : 'js'}`);
    if (fs.existsSync(reduxFilePath) && !replace) {
      console.log(chalk.yellow(`⚠️ Redux slice file already exists: ${reduxFilePath}`));
      return;
    }
    const content = useTS
      ? `import { createSlice, PayloadAction } from '@reduxjs/toolkit';\n\ninterface ${reduxName}State {\n  // Add your state properties here\n}\n\nconst initialState: ${reduxName}State = {\n  // ...\n};\n\nconst ${reduxName}Slice = createSlice({\n  name: '${reduxName}',\n  initialState,\n  reducers: {\n    // add reducers here\n  },\n});\n\nexport const { actions, reducer } = ${reduxName}Slice;\n`
      : `import { createSlice } from '@reduxjs/toolkit';\n\nconst initialState = {\n  // ...\n};\n\nconst ${reduxName}Slice = createSlice({\n  name: '${reduxName}',\n  initialState,\n  reducers: {\n    // add reducers here\n  },\n});\n\nexport const { actions, reducer } = ${reduxName}Slice;\n`;
    fs.writeFileSync(reduxFilePath, content);
    console.log(chalk.green(`✅ Created Redux slice: ${reduxFilePath}`));
  } catch (error: any) {
    console.log(chalk.red(`❌ Error creating Redux slice:`));
    console.error(chalk.red(error.message));
    if (error.code === 'ENOENT') {
      console.log(chalk.yellow('💡 Check that parent directories exist and are writable'));
    } else if (error.code === 'EACCES') {
      console.log(chalk.yellow('💡 You might need permission to write to this directory'));
    }
  }
} 