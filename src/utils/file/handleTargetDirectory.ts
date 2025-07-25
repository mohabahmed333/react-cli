import { TReadlineInterface } from "../../types/ReadLineInterface";
import { CLIConfig } from "../config";
import { askQuestion } from "../prompt";
import chalk from "chalk";
import path from "path";
import { resolveFolderPath } from "./resolveFolderPath";

export async function handleTargetDirectory(
    rl: TReadlineInterface,
    config: CLIConfig,
    folder: string | undefined,
    defaultFolder: string,
    interactive: boolean
  ): Promise<string> {
    let targetDir = path.join(config.baseDir, folder || defaultFolder);
    
    if (interactive && !folder) {
      const useFolder = await askQuestion(rl, chalk.blue(`Add to a specific folder under app/? (y/n): `));
      if (useFolder.toLowerCase() === 'y') {
        const folderName = await askQuestion(rl, chalk.blue('Enter folder name: '));
        if (!folderName) {
          console.log(chalk.red('❌ Folder name required.'));
          rl.close();
          process.exit(1);
        }
        targetDir = await resolveFolderPath(rl, config.baseDir, folderName);
      }
    } else if (folder) {
      targetDir = await resolveFolderPath(rl, config.baseDir, folder, !interactive);
    }
    
    return targetDir;
  }
  