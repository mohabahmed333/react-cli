import { Command } from 'commander';
import chalk from 'chalk';
import { createFile } from '../../utils/createGeneratedFile/file';
import { Interface as ReadlineInterface } from 'readline';

export function registerGenerateEnv(generate: Command, rl: ReadlineInterface) {
  generate
    .command('env')
    .description('Create environment configuration files')
    .option('--replace', 'Replace file if it exists')
    .action(async (options) => {
      const replace = options.replace;
      createFile('.env', '# Environment variables\nREACT_APP_API_URL=http://localhost:3000/api\n', replace);
      createFile('.env.development', '# Development environment\nREACT_APP_ENV=development\n', replace);
      createFile('.env.production', '# Production environment\nREACT_APP_ENV=production\n', replace);
      console.log(chalk.green('✅ Created environment files'));
      rl.close();
    });
}
