import chalk from "chalk";
import fs from "fs";

export async function ensureDirectoryExists(dirPath: string): Promise<void> {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(chalk.green(`📁 Created directory: ${dirPath}`));
    }
  }