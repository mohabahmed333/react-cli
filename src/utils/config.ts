import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { askQuestion } from './prompt';
import readline from 'readline';

export interface CLIConfig {
  baseDir: string;
  projectType: 'react' | 'next';
  typescript: boolean;
  localization: boolean;
}

const defaultConfig: CLIConfig = {
  baseDir: 'src',
  projectType: 'react',
  typescript: false,
  localization: false
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

  console.log(chalk.yellow('\n⚙️ First-time setup'));
  const config: CLIConfig = { ...defaultConfig };

  config.baseDir = (await askQuestion(rl, chalk.blue('Project base directory (src/app): '))) || 'src';
  config.projectType = (await askQuestion(rl, chalk.blue('Project type (react/next): '))) as 'react' | 'next' || 'react';
  config.typescript = (await askQuestion(rl, chalk.blue('Use TypeScript? (y/n): '))) === 'y';
  if (config.projectType === 'next') {
    config.localization = (await askQuestion(rl, chalk.blue('Use [lang] localization? (y/n): '))) === 'y';
  }
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(chalk.green('✅ Configuration saved'));
  return config;
}
