import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { Interface as ReadlineInterface } from 'readline';
import chalk from 'chalk';

export interface ProjectConfig {
  baseDir: string;
  typescript: boolean;
  packageManager: 'npm' | 'yarn' | 'pnpm';
  hasAppFolder: boolean;
  hasSrcFolder: boolean;
  entryPoint: string;
  testingFramework?: 'jest' | 'vitest' | 'none';
  hasRouting: boolean;
  hasStateManagement: boolean;
  cssFramework?: 'tailwind' | 'styled-components' | 'css-modules' | 'none';
}

export async function detectProjectStructure(): Promise<Partial<ProjectConfig>> {
  const config: Partial<ProjectConfig> = {};
  
  // Detect package manager
  config.packageManager = detectPackageManager();
  
  // Check for folder structure
  config.hasAppFolder = fs.existsSync('app');
  config.hasSrcFolder = fs.existsSync('src');
  
  // Determine base directory and entry point
  if (config.hasAppFolder) {
    config.baseDir = 'app';
    config.entryPoint = 'app';
  } else if (config.hasSrcFolder) {
    config.baseDir = 'src';
    config.entryPoint = 'src';
  } else {
    config.baseDir = '.';
    config.entryPoint = '.';
  }
  
  // Detect TypeScript
  config.typescript = detectTypeScript();
  
  // Detect testing framework
  config.testingFramework = detectTestingFramework();
  
  // Detect routing
  config.hasRouting = detectRouting();
  
  // Detect state management
  config.hasStateManagement = detectStateManagement();
  
  // Detect CSS framework
  config.cssFramework = detectCSSFramework();
  
  return config;
}

function detectPackageManager(): 'npm' | 'yarn' | 'pnpm' {
  if (fs.existsSync('yarn.lock')) return 'yarn';
  if (fs.existsSync('pnpm-lock.yaml')) return 'pnpm';
  return 'npm';
}

function detectTypeScript(): boolean {
  if (fs.existsSync('tsconfig.json')) return true;
  
  const packageJsonPath = 'package.json';
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      return Boolean(deps.typescript || deps['@types/react']);
    } catch {
      return false;
    }
  }
  
  return false;
}

function detectTestingFramework(): 'jest' | 'vitest' | 'none' {
  const packageJsonPath = 'package.json';
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      if (deps.vitest) return 'vitest';
      if (deps.jest || deps['@testing-library/jest-dom']) return 'jest';
    } catch {
      return 'none';
    }
  }
  
  return 'none';
}

function detectRouting(): boolean {
  const packageJsonPath = 'package.json';
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      return Boolean(deps['react-router-dom'] || deps['@reach/router'] || deps['next']);
    } catch {
      return false;
    }
  }
  return false;
}

function detectStateManagement(): boolean {
  const packageJsonPath = 'package.json';
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      return Boolean(deps.redux || deps.zustand || deps.recoil || deps['@reduxjs/toolkit']);
    } catch {
      return false;
    }
  }
  return false;
}

function detectCSSFramework(): 'tailwind' | 'styled-components' | 'css-modules' | 'none' {
  const packageJsonPath = 'package.json';
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      if (deps.tailwindcss) return 'tailwind';
      if (deps['styled-components']) return 'styled-components';
      if (fs.existsSync('src') && fs.readdirSync('src').some(file => file.includes('.module.css'))) {
        return 'css-modules';
      }
    } catch {
      return 'none';
    }
  }
  return 'none';
}

export function showLoadingSpinner(message: string): () => void {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  
  const interval = setInterval(() => {
    process.stdout.write(`\r${chalk.cyan(frames[i++ % frames.length])} ${message}`);
  }, 100);
  
  return () => {
    clearInterval(interval);
    process.stdout.write('\r');
  };
}

export function askQuestion(rl: ReadlineInterface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

export async function setupIntelligentConfiguration(rl: ReadlineInterface): Promise<ProjectConfig> {
  const stopSpinner = showLoadingSpinner('Analyzing project structure...');
  
  try {
    const detectedConfig = await detectProjectStructure();
    stopSpinner();
    
    console.log(chalk.blue('🔍 Detected Project Configuration:'));
    console.log(`  ${chalk.gray('TypeScript:')} ${detectedConfig.typescript ? '✅' : '❌'}`);
    console.log(`  ${chalk.gray('Package Manager:')} ${detectedConfig.packageManager}`);
    console.log(`  ${chalk.gray('Base Directory:')} ${detectedConfig.baseDir}`);
    console.log(`  ${chalk.gray('Has Routing:')} ${detectedConfig.hasRouting ? '✅' : '❌'}`);
    console.log(`  ${chalk.gray('CSS Framework:')} ${detectedConfig.cssFramework || 'none'}`);
    console.log('');
    
    // Ask user to confirm or modify configuration
    const useDetected = await askQuestion(rl, 
      chalk.cyan('Use detected configuration? (y/n): ')
    );
    
    if (useDetected.toLowerCase() === 'y' || useDetected.toLowerCase() === 'yes') {
      return detectedConfig as ProjectConfig;
    }
    
    // Manual configuration if user doesn't want auto-detected
    return await manualConfiguration(rl, detectedConfig);
    
  } catch (error) {
    stopSpinner();
    console.error(chalk.red(`Error detecting configuration: ${error instanceof Error ? error.message : 'Unknown error'}`));
    return await manualConfiguration(rl, {});
  }
}

async function manualConfiguration(rl: ReadlineInterface, detected: Partial<ProjectConfig>): Promise<ProjectConfig> {
  const typescript = await askQuestion(rl, 
    chalk.cyan(`Use TypeScript? (${detected.typescript ? 'Y/n' : 'y/N'}): `)
  );
  
  const baseDir = await askQuestion(rl, 
    chalk.cyan(`Base directory (${detected.baseDir || 'src'}): `)
  ) || detected.baseDir || 'src';
  
  return {
    typescript: typescript.toLowerCase() === 'y' || typescript.toLowerCase() === 'yes' || 
               (!!detected.typescript && typescript === ''),
    baseDir,
    packageManager: detected.packageManager || 'npm',
    hasAppFolder: detected.hasAppFolder || false,
    hasSrcFolder: detected.hasSrcFolder || false,
    entryPoint: detected.entryPoint || 'src',
    hasRouting: detected.hasRouting || false,
    hasStateManagement: detected.hasStateManagement || false,
    cssFramework: detected.cssFramework || 'none'
  };
}
