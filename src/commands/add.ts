import { Command } from 'commander';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { detectProjectStructure, showLoadingSpinner, ProjectConfig } from '../utils/intelligentConfig';
import { Interface as ReadlineInterface } from 'readline';
import fs from 'fs';

interface LibraryConfig {
  dependencies: string[];
  devDependencies: string[];
  tsOnly: boolean;
  description: string;
  postInstall?: string;
}

const LIBRARY_CONFIGS: Record<string, LibraryConfig> = {
  'react-router-dom': {
    dependencies: ['react-router-dom'],
    devDependencies: ['@types/react-router-dom'],
    tsOnly: false,
    description: 'React Router for navigation'
  },
  'tailwindcss': {
    dependencies: ['tailwindcss'],
    devDependencies: ['postcss', 'autoprefixer'],
    tsOnly: false,
    description: 'Utility-first CSS framework',
    postInstall: 'tailwind'
  },
  'styled-components': {
    dependencies: ['styled-components'],
    devDependencies: ['@types/styled-components'],
    tsOnly: false,
    description: 'CSS-in-JS library'
  },
  'zustand': {
    dependencies: ['zustand'],
    devDependencies: [],
    tsOnly: false,
    description: 'Small, fast state management'
  },
  'react-query': {
    dependencies: ['@tanstack/react-query'],
    devDependencies: [],
    tsOnly: false,
    description: 'Data fetching and caching library'
  },
  'axios': {
    dependencies: ['axios'],
    devDependencies: [],
    tsOnly: false,
    description: 'HTTP client library'
  },
  'framer-motion': {
    dependencies: ['framer-motion'],
    devDependencies: [],
    tsOnly: false,
    description: 'Animation library for React'
  },
  'material-ui': {
    dependencies: ['@mui/material', '@emotion/react', '@emotion/styled'],
    devDependencies: [],
    tsOnly: false,
    description: 'React components implementing Google\'s Material Design'
  },
  'react-icons': {
    dependencies: ['react-icons'],
    devDependencies: [],
    tsOnly: false,
    description: 'Popular icon libraries for React'
  },
  '@mistralai/mistralai': {
    dependencies: ['@mistralai/mistralai'],
    devDependencies: [],
    tsOnly: false,
    description: 'Mistral AI SDK for code generation'
  }
};

export function registerAddCommand(program: Command, rl: ReadlineInterface) {
  const add = program
    .command('add')
    .alias('+')
    .description('Add a library to your React project')
    .argument('<library>', 'Library name to add')
    .option('-D, --dev', 'Install as dev dependency')
    .action(async (library: string, options) => {
      const stopSpinner = showLoadingSpinner('Detecting project configuration...');
      
      try {
        const config = await detectProjectStructure();
        stopSpinner();
        
        console.log(chalk.blue('📦 Project Configuration:'));
        console.log(`  ${chalk.gray('Package Manager:')} ${config.packageManager}`);
        console.log(`  ${chalk.gray('TypeScript:')} ${config.typescript ? '✅' : '❌'}`);
        console.log(`  ${chalk.gray('Base Directory:')} ${config.baseDir}`);
        console.log('');
        
        if (LIBRARY_CONFIGS[library as keyof typeof LIBRARY_CONFIGS]) {
          await installConfiguredLibrary(library, config as ProjectConfig, options.dev);
        } else {
          await installCustomLibrary(library, config as ProjectConfig, options.dev);
        }
        
      } catch (error) {
        stopSpinner();
        console.error(chalk.red(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
      
      rl.close();
    });

  // List available libraries
  add
    .command('list')
    .description('List available pre-configured libraries')
    .action(() => {
      console.log(chalk.blue('📚 Available Libraries:'));
      console.log('');
      
      Object.entries(LIBRARY_CONFIGS).forEach(([name, config]) => {
        console.log(`  ${chalk.green(name)} - ${config.description}`);
      });
      
      console.log('');
      console.log(chalk.gray('You can also add any npm package by name.'));
      rl.close();
    });
}

async function installConfiguredLibrary(library: string, config: ProjectConfig, isDev: boolean) {
  const libConfig = LIBRARY_CONFIGS[library as keyof typeof LIBRARY_CONFIGS];
  const stopSpinner = showLoadingSpinner(`Installing ${library}...`);
  
  try {
    const { packageManager, typescript } = config;
    
    // Install main dependencies
    const mainDeps = libConfig.dependencies;
    if (mainDeps.length > 0) {
      const installCmd = getInstallCommand(packageManager, mainDeps, isDev);
      execSync(installCmd, { stdio: 'inherit' });
    }
    
    // Install TypeScript types if TypeScript is detected
    if (typescript && libConfig.devDependencies.length > 0) {
      const typeDeps = libConfig.devDependencies;
      const typeInstallCmd = getInstallCommand(packageManager, typeDeps, true);
      execSync(typeInstallCmd, { stdio: 'inherit' });
    }
    
    stopSpinner();
    console.log(chalk.green(`✅ Successfully installed ${library}`));
    
    // Run post-install setup if needed
    if (libConfig.postInstall) {
      await runPostInstallSetup(libConfig.postInstall, config);
    }
    
  } catch (error) {
    stopSpinner();
    console.error(chalk.red(`❌ Failed to install ${library}: ${error instanceof Error ? error.message : 'Unknown error'}`));
  }
}

async function installCustomLibrary(library: string, config: ProjectConfig, isDev: boolean) {
  const stopSpinner = showLoadingSpinner(`Installing ${library}...`);
  
  try {
    const installCmd = getInstallCommand(config.packageManager, [library], isDev);
    execSync(installCmd, { stdio: 'inherit' });
    
    stopSpinner();
    console.log(chalk.green(`✅ Successfully installed ${library}`));
    
  } catch (error) {
    stopSpinner();
    console.error(chalk.red(`❌ Failed to install ${library}: ${error instanceof Error ? error.message : 'Unknown error'}`));
  }
}

function getInstallCommand(packageManager: string, packages: string[], isDev: boolean): string {
  const pkgs = packages.join(' ');
  
  switch (packageManager) {
    case 'yarn':
      return `yarn add ${isDev ? '-D ' : ''}${pkgs}`;
    case 'pnpm':
      return `pnpm add ${isDev ? '-D ' : ''}${pkgs}`;
    default:
      return `npm install ${isDev ? '--save-dev ' : ''}${pkgs}`;
  }
}

async function runPostInstallSetup(setupType: string, config: ProjectConfig) {
  switch (setupType) {
    case 'tailwind':
      await setupTailwind(config);
      break;
  }
}

async function setupTailwind(config: ProjectConfig) {
  const stopSpinner = showLoadingSpinner('Setting up Tailwind CSS...');
  
  try {
    // Initialize Tailwind config
    execSync('npx tailwindcss init -p', { stdio: 'inherit' });
    
    // Update tailwind.config.js with proper content paths
    const tailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./${config.baseDir}/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;
    
    fs.writeFileSync('tailwind.config.js', tailwindConfig);
    
    stopSpinner();
    console.log(chalk.green('✅ Tailwind CSS configured successfully'));
    console.log(chalk.yellow('💡 Don\'t forget to add Tailwind directives to your CSS file:'));
    console.log(chalk.gray('   @tailwind base;'));
    console.log(chalk.gray('   @tailwind components;'));
    console.log(chalk.gray('   @tailwind utilities;'));
    
  } catch (error) {
    stopSpinner();
    console.error(chalk.red(`❌ Failed to setup Tailwind: ${error instanceof Error ? error.message : 'Unknown error'}`));
  }
}
