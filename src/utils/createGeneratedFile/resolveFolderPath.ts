import chalk from "chalk";
 import { askQuestion } from "../ai/prompt";
import { TReadlineInterface } from "../../types/ReadLineInterface";
import path from "path";
import fs from "fs";
import { findFoldersByName } from "./findFolderByName";

export async function resolveFolderPath(
    rl: TReadlineInterface,
    baseDir: string,
    folderName: string,
    suppressCreation = false
  ): Promise<string> {
    if (folderName.includes('/') || folderName.includes('\\')) {
      return path.join(baseDir, folderName);
    }
  
    const baseSearch = path.join(process.cwd(), 'app');
    const matches = findFoldersByName(baseSearch, folderName);
    
    if (matches.length === 0) {
      if (suppressCreation) {
        console.log(chalk.red(`❌ No folder named "${folderName}" found under app/. Use -i to create interactively.`));
        rl.close();
        process.exit(1);
      }
      
      const createNew = await askQuestion(rl, chalk.yellow(`No folder named "${folderName}" found under app/. Create it? (y/n): `));

      if (createNew.toLowerCase() !== 'y') {
        console.log(chalk.yellow('⏩ Operation cancelled'));
        rl.close();
        process.exit(0);
      }
      
      const newDir = path.join(baseSearch, folderName);
      fs.mkdirSync(newDir, { recursive: true });
      console.log(chalk.green(`📁 Created directory: ${newDir}`));
      return newDir;
    }
    
    if (matches.length === 1) {
      return matches[0];
    }
    
    console.log(chalk.yellow('Multiple folders found:'));
    matches.forEach((m, i) => console.log(`${i + 1}: ${m}`));
    const idx = await askQuestion(rl, chalk.blue('Select folder number: '));
    const num = parseInt(idx, 10);
    
    if (isNaN(num) || num < 1 || num > matches.length) {
      console.log(chalk.red('Invalid selection. Operation cancelled.'));
      rl.close();
      process.exit(1);
    }
    
    return matches[num - 1];
  }
  