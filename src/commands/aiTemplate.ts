import chalk from 'chalk';
import { Command } from 'commander';
import { askQuestion } from '../utils/ai/prompt';
import { CLIConfig, setupConfiguration } from '../utils/config/config';
import { createFeatureWithAITemplate } from '../services/aiTemplateService';
import { listTemplates } from '../utils/template/template';
import readline from 'readline';

export function createAITemplateCommand(): Command {
  const command = new Command('ai-template')
    .alias('ait')
    .description('Create complete features using AI-enhanced templates')
    .option('-f, --feature <name>', 'Feature name to create')
    .option('-d, --description <desc>', 'Description of the feature to create')
    .option('-t, --template <name>', 'Specific template to use as base')
    .option('-p, --path <path>', 'Target path for the feature')
    .option('--interactive', 'Run in interactive mode')
    .action(async (options) => {
      try {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });

        const config = await setupConfiguration(rl);

        console.log(chalk.cyan.bold('\n🎨 AI Template Generator'));
        console.log(chalk.white('Create complete, working features using AI-enhanced templates'));

        // Interactive mode or direct execution
        if (options.interactive || (!options.feature && !options.description)) {
          await runInteractiveMode(config, rl);
        } else {
          await runDirectMode(options, config);
        }

        rl.close();
      } catch (error) {
        console.error(chalk.red('AI Template command error:'), error);
        process.exit(1);
      }
    });

  return command;
}

/**
 * Run AI template generation in interactive mode
 */
async function runInteractiveMode(config: any, rl: any) {
  console.log(chalk.cyan('\n📋 Available Templates:'));
  const templates = listTemplates();
  
  if (templates.length === 0) {
    console.log(chalk.yellow('No templates available. You can create features from scratch.'));
  } else {
    templates.forEach((template, index) => {
      console.log(chalk.blue(`  ${index + 1}. ${template.name}`));
      if (template.metadata.description) {
        console.log(chalk.dim(`     ${template.metadata.description}`));
      }
      if (template.metadata.tags && template.metadata.tags.length > 0) {
        console.log(chalk.dim(`     Tags: ${template.metadata.tags.join(', ')}`));
      }
    });
  }

  console.log(chalk.cyan('\n💡 Examples:'));
  console.log(chalk.dim('  - "Create a user dashboard with analytics charts and data tables"'));
  console.log(chalk.dim('  - "Build an e-commerce product catalog with filtering and search"'));
  console.log(chalk.dim('  - "Make a blog admin panel with post management and media upload"'));
  console.log(chalk.dim('  - "Create a real-time chat interface with message history"'));

  const featureName = await askQuestion(
    rl,
    chalk.blue('\n📝 What feature would you like to create? (Feature name): ')
  );

  if (!featureName.trim()) {
    console.log(chalk.yellow('Feature name is required. Exiting.'));
    return;
  }

  const description = await askQuestion(
    rl,
    chalk.blue('\n🎯 Describe the feature in detail: ')
  );

  if (!description.trim()) {
    console.log(chalk.yellow('Feature description is required. Exiting.'));
    return;
  }

  const targetPath = await askQuestion(
    rl,
    chalk.blue(`\n📁 Target path (default: ${config.baseDir}): `)
  );

  const finalPath = targetPath.trim() || config.baseDir;

  console.log(chalk.cyan('\n🔍 AI is analyzing your request and selecting the best template...'));

  const result = await createFeatureWithAITemplate(
    description,
    featureName,
    finalPath,
    config
  );

  if (result.success) {
    console.log(chalk.green.bold('\n🎉 AI Template Generation Complete!'));
    console.log(chalk.cyan('\n📊 Summary:'));
    console.log(chalk.dim(`   Generated Files: ${result.generatedFiles.length}`));
    console.log(chalk.dim(`   Modified Files: ${result.modifiedFiles.length}`));
    
    if (result.generatedFiles.length > 0) {
      console.log(chalk.cyan('\n📁 Generated Files:'));
      result.generatedFiles.forEach(file => {
        console.log(chalk.green(`   ✅ ${file}`));
      });
    }

    if (result.modifiedFiles.length > 0) {
      console.log(chalk.cyan('\n🔄 Modified Files:'));
      result.modifiedFiles.forEach(file => {
        console.log(chalk.blue(`   🔧 ${file}`));
      });
    }

    if (result.nextSteps.length > 0) {
      console.log(chalk.cyan('\n🚀 Next Steps:'));
      result.nextSteps.forEach((step, index) => {
        console.log(chalk.white(`   ${index + 1}. ${step}`));
      });
    }

    console.log(chalk.green('\n✨ Your AI-generated feature is ready to use!'));
  } else {
    console.log(chalk.red.bold('\n❌ AI Template Generation Failed'));
    
    if (result.errors.length > 0) {
      console.log(chalk.red('\n🚨 Errors:'));
      result.errors.forEach(error => {
        console.log(chalk.red(`   • ${error}`));
      });
    }
  }
}

/**
 * Run AI template generation in direct mode
 */
async function runDirectMode(options: any, config: any) {
  const featureName = options.feature;
  const description = options.description;
  const targetPath = options.path || config.baseDir;

  if (!featureName || !description) {
    console.log(chalk.red('Both feature name and description are required in direct mode.'));
    console.log(chalk.white('Use: react-cli ai-template -f "FeatureName" -d "Feature description"'));
    return;
  }

  console.log(chalk.cyan(`\n🎯 Creating feature: ${featureName}`));
  console.log(chalk.dim(`Description: ${description}`));
  console.log(chalk.dim(`Target path: ${targetPath}`));

  const result = await createFeatureWithAITemplate(
    description,
    featureName,
    targetPath,
    config
  );

  if (result.success) {
    console.log(chalk.green(`\n✅ Successfully created ${featureName}`));
    console.log(chalk.dim(`Generated ${result.generatedFiles.length} files`));
  } else {
    console.log(chalk.red(`\n❌ Failed to create ${featureName}`));
    result.errors.forEach(error => console.log(chalk.red(`   Error: ${error}`)));
  }
}

/**
 * Show available templates
 */
export function showAvailableTemplates(): void {
  console.log(chalk.cyan.bold('\n📋 Available AI Templates'));
  
  const templates = listTemplates();
  
  if (templates.length === 0) {
    console.log(chalk.yellow('No templates found.'));
    console.log(chalk.white('Templates should be placed in the .templates directory.'));
    return;
  }

  templates.forEach((template, index) => {
    console.log(chalk.blue(`\n${index + 1}. ${template.name}`));
    console.log(chalk.white(`   ${template.metadata.description || 'No description'}`));
    
    if (template.metadata.tags && template.metadata.tags.length > 0) {
      console.log(chalk.dim(`   Tags: ${template.metadata.tags.join(', ')}`));
    }
    
    if (template.metadata.files && template.metadata.files.length > 0) {
      console.log(chalk.dim(`   Files: ${template.metadata.files.length} files`));
    }
    
    console.log(chalk.dim(`   Version: ${template.metadata.version}`));
  });

  console.log(chalk.cyan('\n💡 Usage:'));
  console.log(chalk.white('  react-cli ai-template --interactive'));
  console.log(chalk.white('  react-cli ai-template -f "FeatureName" -d "Description"'));
}
