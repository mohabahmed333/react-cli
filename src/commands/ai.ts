import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { generateWithAI, getAIProviderDisplayName, getRequiredEnvKey } from '../services/ai-service';
import { CLIConfig, setupConfiguration } from '../utils/config';
import { createFile } from '../utils/file';
import readline from 'readline';
import dotenv from 'dotenv';
import { HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

function createOrUpdateEnvFile(config: CLIConfig) {
  const envPath = path.join(process.cwd(), '.env');
  const requiredKey = getRequiredEnvKey(config.aiProvider || 'gemini');
  
  // Get the appropriate API key value based on provider
  let envContent = '';
  if (config.aiProvider === 'mistral') {
    envContent = 'MISTRAL_API_KEY=mQpvjah6ypr4xkX0sfgkenwptXEL6XxJ';
  } else {
    envContent = 'GEMINI_API_KEY=AIzaSyClVVDkh6LQto_ac2ZbOSo_9_TdjWhUe2s';
  }
  
  if (fs.existsSync(envPath)) {
    // Read existing .env content
    const existingContent = fs.readFileSync(envPath, 'utf-8');
    if (!existingContent.includes(`${requiredKey}=`)) {
      // Append the key if it doesn't exist
      fs.appendFileSync(envPath, `\n${envContent}`);
      console.log(chalk.green(`✅ Added ${requiredKey} to existing .env file`));
    }
  } else {
    // Create new .env file
    fs.writeFileSync(envPath, envContent);
    console.log(chalk.green(`✅ Created new .env file with ${requiredKey}`));
  }
  
  // Force reload environment variables
  dotenv.config({ override: true });
}

function validateAIConfig(config: CLIConfig) {
  if (!config.aiEnabled) {
    console.log(chalk.yellow('AI features are not enabled. Run "yarn re ai enable" to enable them.'));
    return false;
  }
  
  if (!config.aiProvider || !config.aiModel) {
    console.log(chalk.yellow('AI configuration is incomplete. Run "yarn re init" to set up AI features.'));
    return false;
  }

  // Check for the required API key based on provider
  const requiredKey = getRequiredEnvKey(config.aiProvider);
  if (!process.env[requiredKey]) {
    console.log(chalk.yellow(`${requiredKey} not found in environment. Creating/updating .env file...`));
    createOrUpdateEnvFile(config);
    
    // Verify the key was set
    if (!process.env[requiredKey]) {
      console.log(chalk.red(`Failed to set ${requiredKey}. Please check your .env file.`));
      return false;
    }
    console.log(chalk.green(`✅ ${requiredKey} is now configured`));
  }

  return true;
}

export function setupAICommands(program: Command, rl: readline.Interface) {
  const aiCommand = program
    .command('ai')
    .description('AI-powered development tools');

  // Generate code subcommand
  aiCommand
    .command('generate <prompt>')
    .alias('gen')
    .description('Generate code with Gemini AI')
    .option('-o, --output <file>', 'Output file path')
    .action(async (prompt: string, options: { output?: string }) => {
      const config = await setupConfiguration(rl);
      if (!validateAIConfig(config)) {
        return;
      }
      
      const fullPrompt = `You are an expert ${config.projectType} developer. 
        Generate ${config.typescript ? 'TypeScript' : 'JavaScript'} code for:
        ${prompt}
        Output ONLY code with no explanations or markdown formatting.`;
      
      const aiCode = await generateWithAI(fullPrompt, config);
      
      if (aiCode) {
        if (options.output) {
          createFile(options.output, aiCode);
          console.log(chalk.green(`✅ AI-generated: ${options.output}`));
        } else {
          console.log(chalk.cyan(`\n� ${getAIProviderDisplayName(config.aiProvider || 'gemini')} Output:\n`));
          console.log(aiCode);
        }
      }
    });

  // Enhance code subcommand
  aiCommand
    .command('enhance <file>')
    .description('Improve existing file with AI')
    .action(async (filePath: string) => {
      const config = await setupConfiguration(rl);
      if (!validateAIConfig(config)) {
        return;
      }
      
      if (!fs.existsSync(filePath)) {
        console.log(chalk.red(`File not found: ${filePath}`));
        return;
      }
      
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const prompt = `Improve this ${path.extname(filePath).slice(1)} code:
        \n### Current Code:\n${fileContent}
        \n### Improved Code (output ONLY code):`;
      
      const improvedCode = await generateWithAI(prompt, config);
      
      if (improvedCode) {
        fs.writeFileSync(filePath, improvedCode);
        console.log(chalk.green(`✅ AI-enhanced: ${filePath}`));
      }
    });

  // Generate documentation subcommand
  aiCommand
    .command('docs <file>')
    .description('Generate documentation with AI')
    .action(async (filePath: string) => {
      const config = await setupConfiguration(rl);
      if (!validateAIConfig(config)) {
        return;
      }
      
      if (!fs.existsSync(filePath)) {
        console.log(chalk.red(`File not found: ${filePath}`));
        return;
      }
      
      const code = fs.readFileSync(filePath, 'utf-8');
      const prompt = `Generate comprehensive documentation for this code:
        \n### Code:\n${code}
        \n### Documentation:`;
      
      const docs = await generateWithAI(prompt, config);
      
      if (docs) {
        const docsPath = `${filePath}.md`;
        createFile(docsPath, docs);
        console.log(chalk.green(`✅ Documentation generated: ${docsPath}`));
      }
    });

  // Enable AI subcommand
  aiCommand
    .command('enable')
    .description('Enable AI features')
    .option('-p, --provider <provider>', 'AI provider (gemini/mistral)', 'gemini')
    .action(async (options: { provider: string }) => {
      const configPath = path.join(process.cwd(), 'create.config.json');
      let config = await setupConfiguration(rl);
      
      // Validate provider
      const provider = options.provider.toLowerCase();
      if (!['gemini', 'mistral'].includes(provider)) {
        console.log(chalk.red('❌ Invalid provider. Choose "gemini" or "mistral"'));
        return;
      }
      
      // Set required AI configuration
      config.aiEnabled = true;
      config.aiProvider = provider as 'gemini' | 'mistral';
      
      if (provider === 'mistral') {
        config.aiModel = 'mistral-large-latest';
        // Remove Gemini-specific safety settings for Mistral
        delete config.aiSafetySettings;
      } else {
        config.aiModel = 'gemini-1.5-flash-latest';
        config.aiSafetySettings = [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE }
        ];
      }
      
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log(chalk.green(`\n✅ AI features enabled with ${getAIProviderDisplayName(config.aiProvider)}`));
      console.log(chalk.yellow(`Note: Make sure you have ${getRequiredEnvKey(config.aiProvider)} in your .env file`));
      rl.close();
    });

  // Disable AI subcommand
  aiCommand
    .command('disable')
    .description('Disable AI features')
    .action(async () => {
      const configPath = path.join(process.cwd(), 'create.config.json');
      let config = await setupConfiguration(rl);
      config.aiEnabled = false;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log(chalk.yellow('\n❌ AI features disabled'));
      rl.close();
    });

  // Switch AI provider subcommand
  aiCommand
    .command('switch <provider>')
    .description('Switch AI provider (gemini/mistral)')
    .action(async (provider: string) => {
      const configPath = path.join(process.cwd(), 'create.config.json');
      let config = await setupConfiguration(rl);
      
      // Validate provider
      const providerLower = provider.toLowerCase();
      if (!['gemini', 'mistral'].includes(providerLower)) {
        console.log(chalk.red('❌ Invalid provider. Choose "gemini" or "mistral"'));
        return;
      }
      
      const oldProvider = config.aiProvider;
      config.aiProvider = providerLower as 'gemini' | 'mistral';
      
      // Update model and settings based on provider
      if (providerLower === 'mistral') {
        config.aiModel = 'mistral-large-latest';
        // Remove Gemini-specific safety settings
        delete config.aiSafetySettings;
      } else {
        config.aiModel = 'gemini-1.5-flash-latest';
        config.aiSafetySettings = [
          { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE }
        ];
      }
      
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log(chalk.green(`\n✅ Switched from ${getAIProviderDisplayName(oldProvider || 'gemini')} to ${getAIProviderDisplayName(config.aiProvider)}`));
      console.log(chalk.yellow(`Note: Make sure you have ${getRequiredEnvKey(config.aiProvider)} in your .env file`));
      rl.close();
    });
} 