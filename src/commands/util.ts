import { Command } from 'commander';
import chalk from 'chalk';
import readline from 'readline';
import { setupConfiguration } from '../utils/config';
import { askQuestion } from '../utils/prompt';
import { createFile } from '../utils/file';

export function handleUtil(program: Command, rl: readline.Interface) {
  program
    .command('util <name>')
    .description('Create a utility function')
    .option('--ts', 'Override TypeScript setting')
    .option('-i, --interactive', 'Use interactive mode')
    .action(async (name: string, options: any) => {
      const config = await setupConfiguration(rl);
      const useTS = options.ts ?? config.typescript;
      const utilName = options.interactive
        ? (await askQuestion(rl, chalk.blue('Enter utility name: '))) || name
        : name;
      const ext = useTS ? 'ts' : 'js';
      const content = useTS
        ? `export const ${utilName} = (input: string): string => {\n  return input.toUpperCase();\n};\n`
        : `export const ${utilName} = (input) => {\n  return input.toUpperCase();\n};\n`;
      const filePath = `${config.baseDir}/utils/${utilName}.${ext}`;
      if (createFile(filePath, content)) {
        console.log(chalk.green(`✅ Created util: ${filePath}`));
      } else {
        console.log(chalk.yellow(`⚠️ Util exists: ${filePath}`));
      }
      rl.close();
    });
}
