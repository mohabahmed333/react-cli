import { Command } from 'commander';
import chalk from 'chalk';
import readline from 'readline';
import { setupConfiguration } from '../utils/config';
import { askQuestion } from '../utils/prompt';
import { createFile } from '../utils/file';

export function handleType(program: Command, rl: readline.Interface) {
  program
    .command('type <name>')
    .description('Create TypeScript types')
    .option('--ts', 'Override TypeScript setting')
    .option('-i, --interactive', 'Use interactive mode')
    .action(async (name: string, options: any) => {
      const config = await setupConfiguration(rl);
      const useTS = options.ts ?? config.typescript;
      if (!useTS) {
        console.log(chalk.red('TypeScript must be enabled in config'));
        rl.close();
        return;
      }
      const typeName = options.interactive
        ? (await askQuestion(rl, chalk.blue('Enter type name: '))) || name
        : name;
      const content = `export interface ${typeName} {\n  // Add properties here\n}\n\nexport type ${typeName}Type = {\n  id: string;\n  name: string;\n};\n`;
      const filePath = `${config.baseDir}/types/${typeName}.types.ts`;
      if (createFile(filePath, content)) {
        console.log(chalk.green(`✅ Created type: ${filePath}`));
      } else {
        console.log(chalk.yellow(`⚠️ Type exists: ${filePath}`));
      }
      rl.close();
    });
}
