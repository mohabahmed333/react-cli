import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { generateWithGemini } from '../services/gemini-service';
import { CLIConfig, setupConfiguration } from '../utils/config';
import { createFile } from '../utils/file';
import readline from 'readline';
import dotenv from 'dotenv';
import { HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

function createOrUpdateEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const envContent = 'GEMINI_API_KEY=AIzaSyClVVDkh6LQto_ac2ZbOSo_9_TdjWhUe2s';
  
  if (fs.existsSync(envPath)) {
    // Read existing .env content
    const existingContent = fs.readFileSync(envPath, 'utf-8');
    if (!existingContent.includes('GEMINI_API_KEY=')) {
      // Append the key if it doesn't exist
      fs.appendFileSync(envPath, `\n${envContent}`);
      console.log(chalk.green('✅ Added GEMINI_API_KEY to existing .env file'));
    }
  } else {
    // Create new .env file
    fs.writeFileSync(envPath, envContent);
    console.log(chalk.green('✅ Created new .env file with GEMINI_API_KEY'));
  }
  
  // Force reload environment variables
  dotenv.config({ override: true });
}

function validateAIConfig(config: CLIConfig) {
  if (!config.aiEnabled) {
    console.log(chalk.yellow('AI features are not enabled. Run "yarn re ai enable" to enable them.'));
    return false;
  }
  
  if (!config.aiProvider || !config.aiModel || !config.aiSafetySettings) {
    console.log(chalk.yellow('AI configuration is incomplete. Run "yarn re init" to set up AI features.'));
    return false;
  }

  // Check for GEMINI_API_KEY in environment
  if (!process.env.GEMINI_API_KEY) {
    console.log(chalk.yellow('GEMINI_API_KEY not found in environment. Creating/updating .env file...'));
    createOrUpdateEnvFile();
    
    // Verify the key was set
    if (!process.env.GEMINI_API_KEY) {
      console.log(chalk.red('Failed to set GEMINI_API_KEY. Please check your .env file.'));
      return false;
    }
    console.log(chalk.green('✅ GEMINI_API_KEY is now configured'));
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
      
      const aiCode = await generateWithGemini(fullPrompt, config);
      
      if (aiCode) {
        if (options.output) {
          createFile(options.output, aiCode);
          console.log(chalk.green(`✅ AI-generated: ${options.output}`));
        } else {
          console.log(chalk.cyan('\n🧠 Gemini Output:\n'));
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
      
      const improvedCode = await generateWithGemini(prompt, config);
      
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
      
      const docs = await generateWithGemini(prompt, config);
      
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
    .action(async () => {
      const configPath = path.join(process.cwd(), 'create.config.json');
      let config = await setupConfiguration(rl);
      
      // Set required AI configuration
      config.aiEnabled = true;
      config.aiProvider = 'gemini';
      config.aiModel = 'gemini-1.5-flash-latest';
      config.aiSafetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE }
      ];
      
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log(chalk.green('\n✅ AI features enabled'));
      console.log(chalk.yellow('Note: Make sure you have GEMINI_API_KEY in your .env file'));
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
} 