import { Command } from 'commander';
import { Interface as ReadlineInterface } from 'readline';
import { setupConfiguration } from '../utils/config/config';
import { startAIAgent } from '../services/intelligentAIAgent';
import chalk from 'chalk';

export function registerAIAgentCommand(program: Command, rl: ReadlineInterface) {
  program
    .command('ai-agent')
    .alias('agent')
    .description('🤖 Start the intelligent AI agent that analyzes your needs and creates everything automatically')
    .action(async () => {
      try {
        const config = await setupConfiguration(rl);
        await startAIAgent(config, rl);
      } catch (error) {
        console.error(chalk.red('AI Agent Error:'), error);
      } finally {
        rl.close();
      }
    });
}
