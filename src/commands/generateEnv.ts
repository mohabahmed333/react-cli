import { Command } from 'commander';
import chalk from 'chalk';
import { createFile } from '../utils/file';

export function registerGenerateEnv(generate: Command, rl: any) {
  generate
    .command('env')
    .description('Create environment configuration files')
    .option('--replace', 'Replace file if it exists')
    .action(async (options: any) => {
      const replace = options.replace;
      createFile('.env', '# Environment variables\nREACT_APP_API_URL=http://localhost:3000/api\n', replace);
      createFile('.env.development', '# Development environment\nREACT_APP_ENV=development\n', replace);
      createFile('.env.production', '# Production environment\nREACT_APP_ENV=production\n', replace);
      console.log(chalk.green('✅ Created environment files'));
      rl.close();
    });
}
