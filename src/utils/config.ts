import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { askQuestion } from './prompt';
import readline from 'readline';
import { buildTools, getBuildToolConfig } from './buildTools';
import { HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { setupIntelligentConfiguration, ProjectConfig } from './intelligentConfig';

export interface DocsConfig {
  outputDir?: string;
  formats?: string[];
  theme?: string;
  include?: string[];
  exclude?: string[];
}

export interface CLIConfig {
  baseDir: string;
  projectType: 'react' | 'next';
  buildTool: 'vite' | 'react-scripts' | 'next';
  typescript: boolean;
  localization: boolean;
  port?: number;
  docs?: DocsConfig;
  aiEnabled: boolean;
  aiProvider?: 'gemini' | 'mistral';
  aiModel?: string;
  aiSafetySettings?: Array<{
    category: HarmCategory;
    threshold: HarmBlockThreshold;
  }>;
}

const defaultConfig: CLIConfig = {
  baseDir: 'src',
  projectType: 'react',
  buildTool: 'vite',
  typescript: false,
  localization: false,
  port: 5173,
  aiEnabled: false,
  aiProvider: 'gemini',
  aiModel: 'gemini-1.5-flash-latest',
  aiSafetySettings: [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE }
  ]
};

export async function setupConfiguration(rl: readline.Interface): Promise<CLIConfig> {
  const configPath = path.join(process.cwd(), 'create.config.json');
  try {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (e) {
    console.error(chalk.red('Error reading config:'), e);
  }

  console.log(chalk.yellow('\n⚙️ Intelligent Project Setup'));
  
  // Use intelligent configuration detection
  const intelligentConfig = await setupIntelligentConfiguration(rl);
  
  // Convert intelligent config to CLI config
  const config: CLIConfig = {
    ...defaultConfig,
    baseDir: intelligentConfig.baseDir,
    typescript: intelligentConfig.typescript,
    // Detect project type based on structure and dependencies
    projectType: intelligentConfig.hasAppFolder ? 'next' : 'react',
    buildTool: intelligentConfig.hasAppFolder ? 'next' : 'vite'
  };

  // Additional configuration questions
  if (config.projectType === 'next') {
    config.localization = (await askQuestion(rl, chalk.blue('Use [lang] localization? (y/n): '))) === 'y';
  }

  // AI Configuration
  config.aiEnabled = (await askQuestion(rl, chalk.blue('Enable AI features? (y/n): '))) === 'y';
  
  if (config.aiEnabled) {
    const aiProvider = await askQuestion(rl, chalk.blue('Choose AI provider (gemini/mistral): ')) || 'gemini';
    config.aiProvider = ['gemini', 'mistral'].includes(aiProvider) ? aiProvider as 'gemini' | 'mistral' : 'gemini';
    
    if (config.aiProvider === 'mistral') {
      config.aiModel = await askQuestion(rl, chalk.blue('Mistral model (mistral-large/mistral-medium/mistral-small): ')) || 'mistral-large-latest';
      if (!config.aiModel.includes('latest')) {
        config.aiModel = config.aiModel + '-latest';
      }
      console.log(chalk.yellow('Note: Add MISTRAL_API_KEY to .env for Mistral AI features'));
    } else {
      config.aiModel = await askQuestion(rl, chalk.blue('Gemini model (gemini-1.5-flash/gemini-1.5-pro): ')) || 'gemini-1.5-flash-latest';
      if (!config.aiModel.includes('latest')) {
        config.aiModel = config.aiModel + '-latest';
      }
      console.log(chalk.yellow('Note: Add GEMINI_API_KEY to .env for Gemini AI features'));
    }
  }

  const customPort = await askQuestion(rl, chalk.blue('Custom dev server port (leave empty for default): '));
  if (customPort) {
    config.port = parseInt(customPort, 10);
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  
  console.log(chalk.green('\n✅ Configuration saved!'));
  console.log(chalk.blue('📋 Final Configuration:'));
  console.log(`  ${chalk.gray('Base Directory:')} ${config.baseDir}`);
  console.log(`  ${chalk.gray('Project Type:')} ${config.projectType}`);
  console.log(`  ${chalk.gray('Build Tool:')} ${config.buildTool}`);
  console.log(`  ${chalk.gray('TypeScript:')} ${config.typescript ? '✅' : '❌'}`);
  console.log(`  ${chalk.gray('AI Features:')} ${config.aiEnabled ? '✅' : '❌'}`);
  
  return config;
}
