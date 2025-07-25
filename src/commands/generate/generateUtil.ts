import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { setupConfiguration } from '../../utils/config';
import { askQuestion } from '../../utils/prompt';
import { createFile } from '../../utils/file';
import { Interface as ReadlineInterface } from 'readline';
import { GenerateOptions } from '../../utils/generateAIHelper';
import { findFoldersByName } from '../../utils/file/findFolderByName';
 
export function registerGenerateUtil(generate: Command, rl: ReadlineInterface) {
  generate
    .command('util [name] [folder]')
    .description('Generate a utility function (optionally in a specific folder under app/)')
    .option('--ts', 'Override TypeScript setting')
    .option('-i, --interactive', 'Use interactive mode for util and folder selection')
    .option('--replace', 'Replace file if it exists')
    .action(async (name: string | undefined, folder: string | undefined, options: GenerateOptions) => {
      const config = await setupConfiguration(rl);
      const useTS = options.useTS ?? config.typescript;
      let utilName = name;
      let targetDir: string | undefined = undefined;
      if (options.interactive) {
        // 1. Prompt for util name
        utilName = (await askQuestion(rl, chalk.blue('Enter util name (camelCase): '))) || '';
        if (!/^[a-z][a-zA-Z0-9]*$/.test(utilName)) {
          console.log(chalk.red('❌ Util name must be camelCase and start with a lowercase letter'));
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
                console.log(chalk.yellow('⏩ Util creation cancelled'));
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
                console.log(chalk.red('Invalid selection. Util creation cancelled.'));
                rl.close();
                return;
              }
              targetDir = chosen;
            }
          }
        } else {
          targetDir = path.join(config.baseDir, 'utils');
        }
        await createUtilInPath(utilName, targetDir, useTS, options.replace);
        rl.close();
        return;
      }
      // Non-interactive mode (legacy)
      if (!utilName) {
        console.log(chalk.red('❌ Util name is required.'));
        rl.close();
        return;
      }
      if (!/^[a-z][a-zA-Z0-9]*$/.test(utilName)) {
        console.log(chalk.red('❌ Util name must be camelCase and start with a lowercase letter'));
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
        await createUtilInPath(utilName, targetDir, useTS, options.replace);
      } else {
        const filePath = `${config.baseDir}/utils/${utilName}.${useTS ? 'ts' : 'js'}`;
        const content = useTS
          ? `export const ${utilName} = (input: string): string => {\n  return input.toUpperCase();\n};\n`
          : `export const ${utilName} = (input) => {\n  return input.toUpperCase();\n};\n`;
        if (createFile(filePath, content, options.replace)) {
          console.log(chalk.green(`✅ Created util: ${filePath}`));
        } else {
          console.log(chalk.yellow(`⚠️ Util exists: ${filePath} (use --replace to overwrite)`));
        }
      }
      rl.close();
    });
}

async function createUtilInPath(utilName: string, fullPath: string, useTS: boolean, replace = false) {
  try {
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(chalk.green(`📁 Created directory: ${fullPath}`));
    }
    const utilFilePath = path.join(fullPath, `${utilName}.${useTS ? 'ts' : 'js'}`);
    if (fs.existsSync(utilFilePath) && !replace) {
      console.log(chalk.yellow(`⚠️ Util file already exists: ${utilFilePath}`));
      return;
    }
    const content = useTS
      ? `export const ${utilName} = (input: string): string => {\n  return input.toUpperCase();\n};\n`
      : `export const ${utilName} = (input) => {\n  return input.toUpperCase();\n};\n`;
    fs.writeFileSync(utilFilePath, content);
    console.log(chalk.green(`✅ Created util: ${utilFilePath}`));
  } catch (error: unknown ) {
    console.log(chalk.red(`❌ Error creating util:`));
    console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      console.log(chalk.yellow('💡 Check that parent directories exist and are writable'));
    } else if (error instanceof Error && 'code' in error && error.code === 'EACCES') {
      console.log(chalk.yellow('💡 You might need permission to write to this directory'));
    }
  }
} 