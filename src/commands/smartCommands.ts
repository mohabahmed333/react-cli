import { Command } from 'commander';
import { Interface as ReadlineInterface } from 'readline';
import { setupConfiguration } from '../utils/config/config';
import { IntelligentAIAgent } from '../services/intelligentAIAgent';
import chalk from 'chalk';

export function registerSmartCommand(program: Command, rl: ReadlineInterface) {
  program
    .command('smart <description>')
    .alias('s')
    .description('🧠 Smart AI that creates everything you need based on your description')
    .action(async (description: string) => {
      try {
        console.log(chalk.cyan.bold('\n🧠 Smart AI Mode Activated!'));
        console.log(chalk.white(`Building: "${description}"`));
        
        const config = await setupConfiguration(rl);
        const agent = new IntelligentAIAgent(config, rl);
        
        await agent.analyzeAndExecute(description);
      } catch (error) {
        console.error(chalk.red('Smart AI Error:'), error);
      } finally {
        rl.close();
      }
    });

  // Also add a quick "build" command
  program
    .command('build <description>')
    .alias('b')
    .description('🚀 Quickly build anything with AI')
    .action(async (description: string) => {
      try {
        const config = await setupConfiguration(rl);
        const agent = new IntelligentAIAgent(config, rl);
        
        console.log(chalk.cyan.bold('\n🚀 Building with AI...'));
        await agent.analyzeAndExecute(description);
      } catch (error) {
        console.error(chalk.red('Build Error:'), error);
      } finally {
        rl.close();
      }
    });
}
