import { Command } from 'commander';
import chalk from 'chalk';
import readline from 'readline';
import { setupConfiguration } from '../utils/config';
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

  program
    .command('enable-ai')
    .description('Enable AI features')
    .action(async () => {
      const configPath = path.join(process.cwd(), 'create.config.json');
      let config = await setupConfiguration(rl);
      
      // Set required AI configuration
      config.aiEnabled = true;
      config.aiProvider = 'gemini';
      config.aiModel = 'gemini-1.5-flash-latest';
      config.aiSafetySettings = [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' }
      ];
      
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log(chalk.green('\n✅ AI features enabled'));
      console.log(chalk.yellow('Note: Make sure you have GEMINI_API_KEY in your .env file'));
      rl.close();
    });

  program
    .command('disable-ai')
    .description('Disable AI features')
    .action(async () => {
      const configPath = path.join(process.cwd(), 'create.config.json');
      let config = await setupConfiguration(rl);
      config.aiEnabled = false;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log(chalk.yellow('\n❌ AI features disabled'));
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
