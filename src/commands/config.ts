import { Command } from 'commander';
import chalk from 'chalk';
import readline from 'readline';
import { setupConfiguration } from '../utils/config/config';
import fs from 'fs';
import path from 'path';

export function handleConfig(program: Command, rl: readline.Interface) {
  program
    .command('config')
    .description('Show current config')
    .action(async () => {
      const config = await setupConfiguration(rl);
      console.log(chalk.cyan('\nCurrent Config:'));
      console.log(JSON.stringify(config, null, 2));
      rl.close();
    });
}



export function handleInit(program: Command, rl: readline.Interface) {
  program
    .command('init')
    .description('Initialize project config')
    .action(async () => {
      // Delete existing config to force new setup
      const configPath = path.join(process.cwd(), 'create.config.json');
      if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath);
      }
      const config = await setupConfiguration(rl);
      console.log(chalk.green('\n✅ Configuration updated:'));
      console.log(JSON.stringify(config, null, 2));
      rl.close();
    });
}
