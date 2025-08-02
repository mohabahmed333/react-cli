import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { Interface as ReadlineInterface } from 'readline';
import { CLIConfig, setupConfiguration } from '../utils/config/config';
import { askQuestion, askBoolean, askChoice } from '../utils/ai/prompt';
import { displayAIStatus, validateAIConfig } from '../utils/config/ai/aiConfig';

export function registerAIConfigCommands(program: Command, rl: ReadlineInterface) {
  const aiConfig = program
    .command('ai-config')
    .description('Manage AI configuration settings');

  // Enable AI
  aiConfig
    .command('enable')
    .description('Enable AI features')
    .action(async () => {
      try {
        const config = await setupConfiguration(rl);
        
        if (config.aiEnabled) {
          console.log(chalk.yellow('AI is already enabled'));
          displayAIStatus(config);
          return;
        }

        config.aiEnabled = true;
        
        // Choose provider
        const provider = await askChoice(rl, 'Choose AI provider:', [
          { value: 'gemini', label: 'Google Gemini (Recommended)' },
          { value: 'mistral', label: 'Mistral AI' }
        ]);
        config.aiProvider = provider as 'gemini' | 'mistral';
        
        // Choose model
        if (provider === 'mistral') {
          const model = await askChoice(rl, 'Choose Mistral model:', [
            { value: 'mistral-large-latest', label: 'Mistral Large (Most capable)' },
            { value: 'mistral-medium-latest', label: 'Mistral Medium (Balanced)' },
            { value: 'mistral-small-latest', label: 'Mistral Small (Fastest)' }
          ]);
          config.aiModel = model;
          console.log(chalk.yellow('\\n⚠️  Make sure to set MISTRAL_API_KEY in your .env file'));
        } else {
          const model = await askChoice(rl, 'Choose Gemini model:', [
            { value: 'gemini-1.5-flash-latest', label: 'Gemini 1.5 Flash (Fast, Recommended)' },
            { value: 'gemini-1.5-pro-latest', label: 'Gemini 1.5 Pro (More capable)' }
          ]);
          config.aiModel = model;
          console.log(chalk.yellow('\\n⚠️  Make sure to set GEMINI_API_KEY in your .env file'));
        }

        // Save configuration
        const configPath = path.join(process.cwd(), 'react-cli.config.json');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        
        console.log(chalk.green('\\n✅ AI features enabled successfully!'));
        displayAIStatus(config);
        
      } catch (error) {
        console.error(chalk.red('❌ Error enabling AI:'), error);
      } finally {
        rl.close();
      }
    });

  // Disable AI
  aiConfig
    .command('disable')
    .description('Disable AI features')
    .action(async () => {
      try {
        const config = await setupConfiguration(rl);
        
        if (!config.aiEnabled) {
          console.log(chalk.yellow('AI is already disabled'));
          return;
        }

        const confirm = await askBoolean(rl, 'Are you sure you want to disable AI features?');
        if (!confirm) {
          console.log(chalk.blue('Operation cancelled'));
          return;
        }

        config.aiEnabled = false;
        
        // Save configuration
        const configPath = path.join(process.cwd(), 'react-cli.config.json');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        
        console.log(chalk.green('✅ AI features disabled successfully!'));
        
      } catch (error) {
        console.error(chalk.red('❌ Error disabling AI:'), error);
      } finally {
        rl.close();
      }
    });

  // Show AI status
  aiConfig
    .command('status')
    .description('Show current AI configuration status')
    .action(async () => {
      try {
        const config = await setupConfiguration(rl);
        displayAIStatus(config);
        
        if (config.aiEnabled) {
          const validation = validateAIConfig(config);
          if (!validation.valid) {
            console.log(chalk.red('\\n🔧 To fix configuration issues:'));
            validation.errors.forEach(error => {
              if (error.includes('GEMINI_API_KEY')) {
                console.log(chalk.yellow('  • Create a .env file and add: GEMINI_API_KEY=your_api_key'));
              } else if (error.includes('MISTRAL_API_KEY')) {
                console.log(chalk.yellow('  • Create a .env file and add: MISTRAL_API_KEY=your_api_key'));
              } else {
                console.log(chalk.yellow(`  • ${error}`));
              }
            });
          }
        }
        
      } catch (error) {
        console.error(chalk.red('❌ Error checking AI status:'), error);
      } finally {
        rl.close();
      }
    });

  // Switch provider
  aiConfig
    .command('switch')
    .description('Switch AI provider')
    .action(async () => {
      try {
        const config = await setupConfiguration(rl);
        
        if (!config.aiEnabled) {
          console.log(chalk.yellow('AI is disabled. Enable it first with: ai-config enable'));
          return;
        }

        const currentProvider = config.aiProvider || 'gemini';
        console.log(chalk.blue(`Current provider: ${currentProvider}`));
        
        const newProvider = await askChoice(rl, 'Switch to:', [
          { value: 'gemini', label: 'Google Gemini' },
          { value: 'mistral', label: 'Mistral AI' }
        ]);

        if (newProvider === currentProvider) {
          console.log(chalk.yellow('Already using that provider'));
          return;
        }

        config.aiProvider = newProvider as 'gemini' | 'mistral';
        
        // Update model based on provider
        if (newProvider === 'mistral') {
          const model = await askChoice(rl, 'Choose Mistral model:', [
            { value: 'mistral-large-latest', label: 'Mistral Large (Most capable)' },
            { value: 'mistral-medium-latest', label: 'Mistral Medium (Balanced)' },
            { value: 'mistral-small-latest', label: 'Mistral Small (Fastest)' }
          ]);
          config.aiModel = model;
          console.log(chalk.yellow('\\n⚠️  Make sure to set MISTRAL_API_KEY in your .env file'));
        } else {
          const model = await askChoice(rl, 'Choose Gemini model:', [
            { value: 'gemini-1.5-flash-latest', label: 'Gemini 1.5 Flash (Fast, Recommended)' },
            { value: 'gemini-1.5-pro-latest', label: 'Gemini 1.5 Pro (More capable)' }
          ]);
          config.aiModel = model;
          console.log(chalk.yellow('\\n⚠️  Make sure to set GEMINI_API_KEY in your .env file'));
        }

        // Save configuration
        const configPath = path.join(process.cwd(), 'react-cli.config.json');
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        
        console.log(chalk.green(`\\n✅ Switched to ${newProvider} successfully!`));
        displayAIStatus(config);
        
      } catch (error) {
        console.error(chalk.red('❌ Error switching AI provider:'), error);
      } finally {
        rl.close();
      }
    });
}
