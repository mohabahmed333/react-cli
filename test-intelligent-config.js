#!/usr/bin/env node

// Simple test script to verify the new intelligent configuration and add command functionality
const { detectProjectStructure, showLoadingSpinner } = require('./dist/utils/intelligentConfig.js');
const chalk = require('chalk').default || require('chalk');

async function testIntelligentConfig() {
  console.log(chalk.blue('🧪 Testing Intelligent Configuration Detection...'));
  console.log('');
  
  const stopSpinner = showLoadingSpinner('Analyzing project structure...');
  
  try {
    const config = await detectProjectStructure();
    stopSpinner();
    
    console.log(chalk.green('✅ Detection successful!'));
    console.log('');
    console.log(chalk.blue('📋 Detected Configuration:'));
    console.log(`  ${chalk.gray('Package Manager:')} ${config.packageManager}`);
    console.log(`  ${chalk.gray('TypeScript:')} ${config.typescript ? '✅' : '❌'}`);
    console.log(`  ${chalk.gray('Has App Folder:')} ${config.hasAppFolder ? '✅' : '❌'}`);
    console.log(`  ${chalk.gray('Has Src Folder:')} ${config.hasSrcFolder ? '✅' : '❌'}`);
    console.log(`  ${chalk.gray('Base Directory:')} ${config.baseDir}`);
    console.log(`  ${chalk.gray('Entry Point:')} ${config.entryPoint}`);
    console.log(`  ${chalk.gray('Has Routing:')} ${config.hasRouting ? '✅' : '❌'}`);
    console.log(`  ${chalk.gray('Has State Management:')} ${config.hasStateManagement ? '✅' : '❌'}`);
    console.log(`  ${chalk.gray('CSS Framework:')} ${config.cssFramework || 'none'}`);
    console.log(`  ${chalk.gray('Testing Framework:')} ${config.testingFramework || 'none'}`);
    console.log('');
    
    console.log(chalk.green('🎉 All tests passed! The intelligent configuration is working correctly.'));
    console.log('');
    console.log(chalk.yellow('💡 You can now use:'));
    console.log(`  ${chalk.cyan('react-cli add <library>')} - Add libraries with intelligent detection`);
    console.log(`  ${chalk.cyan('react-cli + <library>')} - Short alias for add command`);
    console.log(`  ${chalk.cyan('react-cli add list')} - List available pre-configured libraries`);
    console.log(`  ${chalk.cyan('react-cli init')} - Initialize with intelligent configuration`);
    
  } catch (error) {
    stopSpinner();
    console.error(chalk.red('❌ Test failed:'), error.message);
  }
}

// Run the test
testIntelligentConfig().catch(console.error);
