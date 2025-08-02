#!/usr/bin/env node

/**
 * Installation script for Mistral AI integration
 * This script helps users set up Mistral AI in their React CLI tool
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

function checkPackageManager(): 'npm' | 'yarn' | 'pnpm' {
  try {
    execSync('yarn --version', { stdio: 'ignore' });
    return 'yarn';
  } catch {
    try {
      execSync('pnpm --version', { stdio: 'ignore' });
      return 'pnpm';
    } catch {
      return 'npm';
    }
  }
}

function installMistralAI() {
  const packageManager = checkPackageManager();
  
  console.log(chalk.blue('🤖 Installing Mistral AI package...'));
  
  try {
    let command: string;
    switch (packageManager) {
      case 'yarn':
        command = 'yarn add @mistralai/mistralai';
        break;
      case 'pnpm':
        command = 'pnpm add @mistralai/mistralai';
        break;
      default:
        command = 'npm install @mistralai/mistralai';
    }
    
    console.log(chalk.gray(`Running: ${command}`));
    execSync(command, { stdio: 'inherit' });
    console.log(chalk.green('✅ Mistral AI package installed successfully!'));
    return true;
  } catch (error) {
    console.error(chalk.red('❌ Failed to install Mistral AI package:'), error);
    return false;
  }
}

function setupEnvironment() {
  const envPath = path.join(process.cwd(), '.env');
  const envExample = `
# Mistral AI Configuration
MISTRAL_API_KEY=your_mistral_api_key_here

# Get your API key from: https://console.mistral.ai/
# After getting your key, replace 'your_mistral_api_key_here' with your actual key
`;

  try {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf-8');
      if (!content.includes('MISTRAL_API_KEY')) {
        fs.appendFileSync(envPath, envExample);
        console.log(chalk.green('✅ Added MISTRAL_API_KEY to existing .env file'));
      } else {
        console.log(chalk.yellow('ℹ️ MISTRAL_API_KEY already exists in .env file'));
      }
    } else {
      fs.writeFileSync(envPath, envExample.trim());
      console.log(chalk.green('✅ Created .env file with MISTRAL_API_KEY'));
    }
    return true;
  } catch (error) {
    console.error(chalk.red('❌ Failed to setup environment:'), error);
    return false;
  }
}

function updateMistralService() {
  const servicePath = path.join(__dirname, 'services', 'mistral-service.ts');
  
  try {
    let content = fs.readFileSync(servicePath, 'utf-8');
    
    // Replace the placeholder import with the real one
    content = content.replace(
      '// Note: Install @mistralai/mistralai package: npm install @mistralai/mistralai\n// import MistralClient from \'@mistralai/mistralai\';',
      'import MistralClient from \'@mistralai/mistralai\';'
    );
    
    // Replace the temporary interface and constructor
    content = content.replace(
      /\/\/ Temporary interface to avoid import errors until package is installed[\s\S]*?};/,
      ''
    );
    
    content = content.replace(
      /\/\/ Temporary constructor function[\s\S]*?};/,
      ''
    );
    
    // Replace createMistralClient calls with new MistralClient
    content = content.replace(/createMistralClient/g, 'new MistralClient');
    
    fs.writeFileSync(servicePath, content);
    console.log(chalk.green('✅ Updated Mistral service with real implementation'));
    return true;
  } catch (error) {
    console.error(chalk.red('❌ Failed to update Mistral service:'), error);
    return false;
  }
}

function main() {
  console.log(chalk.cyan('🚀 Setting up Mistral AI for React CLI'));
  console.log(chalk.gray('This will install the required package and configure your environment\n'));
  
  // Step 1: Install package
  const packageInstalled = installMistralAI();
  if (!packageInstalled) {
    console.log(chalk.red('❌ Setup failed at package installation'));
    process.exit(1);
  }
  
  // Step 2: Setup environment
  const envSetup = setupEnvironment();
  if (!envSetup) {
    console.log(chalk.red('❌ Setup failed at environment configuration'));
    process.exit(1);
  }
  
  // Step 3: Update service
  const serviceUpdated = updateMistralService();
  if (!serviceUpdated) {
    console.log(chalk.yellow('⚠️ Could not update service automatically. You may need to manually import MistralClient.'));
  }
  
  // Success message
  console.log(chalk.green('\n✅ Mistral AI setup complete!'));
  console.log(chalk.blue('\n📋 Next steps:'));
  console.log(chalk.gray('1. Get your API key from: https://console.mistral.ai/'));
  console.log(chalk.gray('2. Replace "your_mistral_api_key_here" in .env with your actual key'));
  console.log(chalk.gray('3. Enable Mistral AI: yarn re ai enable --provider mistral'));
  console.log(chalk.gray('4. Try it: yarn re mistral create component MyComponent'));
  
  console.log(chalk.cyan('\n🎉 You\'re ready to use Mistral AI with React CLI!'));
}

// Run the setup
main();
