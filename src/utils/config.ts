import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { askQuestion } from './prompt';
import readline from 'readline';
import { buildTools, getBuildToolConfig } from './buildTools';

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
}

const defaultConfig: CLIConfig = {
  baseDir: 'src',
  projectType: 'react',
  buildTool: 'vite',
  typescript: false,
  localization: false,
  port: 5173
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
  
  const buildTool = await askQuestion(rl, chalk.blue('Build tool (vite/react-scripts): '));
  config.buildTool = buildTool as 'vite' | 'react-scripts' | 'next' || 'vite';

  const toolConfig = getBuildToolConfig({ buildTool: config.buildTool });
  if (config.buildTool !== toolConfig.id) {
    console.log(chalk.yellow(`Warning: Unknown build tool "${config.buildTool}". Defaulting to vite.`));
    config.buildTool = 'vite';
  }

  config.typescript = (await askQuestion(rl, chalk.blue('Use TypeScript? (y/n): '))) === 'y';
  
  if (config.projectType === 'next') {
    config.buildTool = 'next';
    config.localization = (await askQuestion(rl, chalk.blue('Use [lang] localization? (y/n): '))) === 'y';
  }

  const customPort = await askQuestion(rl, chalk.blue(`Development server port (${toolConfig.defaultPort}): `));
  
  if (customPort && !isNaN(parseInt(customPort))) {
    config.port = parseInt(customPort);
  } else {
    config.port = toolConfig.defaultPort;
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(chalk.green('✅ Configuration saved'));
  return config;
}
