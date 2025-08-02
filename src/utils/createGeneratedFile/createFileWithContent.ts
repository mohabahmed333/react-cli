import chalk from "chalk";
import fs from "fs";

export function createFileWithContent(
    filePath: string,
    content: string,
    replace: boolean,
    successMessage: string,
    existsMessage: string
  ): boolean {
    if (fs.existsSync(filePath) && !replace) {
      console.log(chalk.yellow(existsMessage));
      return false;
    }
    
    fs.writeFileSync(filePath, content);
    console.log(chalk.green(successMessage));
    return true;
  }