import { Command } from 'commander';
import chalk from 'chalk';
import { CLIConfig, setupConfiguration } from '../utils/config/config';
import { createResource, showResourceCreationExample, ResourceOptions } from '../utils/ai/mistralResourceCreator';
import { Interface as ReadlineInterface } from 'readline';
import { askQuestion } from '../utils/ai/prompt';

export function registerMistralCommand(program: Command, rl: ReadlineInterface) {
  const mistral = program
    .command('mistral')
    .alias('mai')
    .description('Mistral AI-powered resource generation');

  // Generate resource subcommand
  mistral
    .command('create <type> <name>')
    .description('Create a resource using Mistral AI (hook|util|type|page|component|service)')
    .option('-f, --functionality <desc>', 'Describe the functionality you want')
    .option('--css', 'Include CSS modules (for components/pages)')
    .option('--components', 'Include sub-components (for pages)')
    .option('--test', 'Generate test files')
    .action(async (type: string, name: string, options: any) => {
      const config = await setupConfiguration(rl);
      
      // Validate AI configuration
      if (!config.aiEnabled) {
        console.log(chalk.yellow('🤖 AI features are not enabled. Run "yarn re ai enable --provider mistral" to enable Mistral AI.'));
        rl.close();
        return;
      }
      
      if (config.aiProvider !== 'mistral') {
        console.log(chalk.yellow('🤖 Current AI provider is not Mistral. Run "yarn re ai switch mistral" to switch.'));
        rl.close();
        return;
      }
      
      // Validate resource type
      const validTypes = ['hook', 'util', 'type', 'page', 'component', 'service'];
      if (!validTypes.includes(type)) {
        console.log(chalk.red(`❌ Invalid resource type. Choose from: ${validTypes.join(', ')}`));
        rl.close();
        return;
      }
      
      // Collect additional functionality if not provided
      let functionality = options.functionality;
      if (!functionality) {
        functionality = await askQuestion(rl, chalk.blue(`Describe what ${name} should do: `));
      }
      
      const resourceOptions: ResourceOptions = {
        functionality,
        css: options.css,
        components: options.components,
        test: options.test
      };
      
      console.log(chalk.cyan(`\n🚀 Creating ${type} "${name}" with Mistral AI...`));
      console.log(chalk.gray(`Functionality: ${functionality || 'Default behavior'}`));
      
      await createResource(type as any, name, config, resourceOptions);
      
      rl.close();
    });

  // Interactive creation subcommand
  mistral
    .command('interactive')
    .alias('i')
    .description('Interactive resource creation with Mistral AI')
    .action(async () => {
      const config = await setupConfiguration(rl);
      
      // Validate AI configuration
      if (!config.aiEnabled || config.aiProvider !== 'mistral') {
        console.log(chalk.yellow('🤖 Mistral AI is not configured. Run "yarn re ai enable --provider mistral" to set it up.'));
        rl.close();
        return;
      }
      
      console.log(chalk.cyan('\n🤖 Interactive Mistral AI Resource Creator'));
      console.log(chalk.gray('Let\'s create something amazing together!\n'));
      
      // Ask for resource type
      const validTypes = ['hook', 'util', 'type', 'page', 'component', 'service'];
      const type = await askQuestion(rl, chalk.blue(`What type of resource? (${validTypes.join('/')}): `));
      
      if (!validTypes.includes(type)) {
        console.log(chalk.red('❌ Invalid resource type'));
        rl.close();
        return;
      }
      
      // Ask for name
      const name = await askQuestion(rl, chalk.blue('Resource name: '));
      if (!name) {
        console.log(chalk.red('❌ Name is required'));
        rl.close();
        return;
      }
      
      // Ask for functionality
      const functionality = await askQuestion(rl, chalk.blue('Describe what it should do: '));
      
      // Ask for additional options based on type
      let css = false;
      let components = false;
      let test = false;
      
      if (['component', 'page'].includes(type)) {
        css = (await askQuestion(rl, chalk.blue('Include CSS modules? (y/n): '))) === 'y';
      }
      
      if (type === 'page') {
        components = (await askQuestion(rl, chalk.blue('Include sub-components? (y/n): '))) === 'y';
      }
      
      test = (await askQuestion(rl, chalk.blue('Generate tests? (y/n): '))) === 'y';
      
      const resourceOptions: ResourceOptions = {
        functionality,
        css,
        components,
        test
      };
      
      console.log(chalk.cyan(`\n🚀 Creating ${type} "${name}" with Mistral AI...`));
      console.log(chalk.gray('Configuration:'));
      console.log(chalk.gray(`  - Functionality: ${functionality || 'Default behavior'}`));
      console.log(chalk.gray(`  - CSS Modules: ${css ? '✅' : '❌'}`));
      console.log(chalk.gray(`  - Sub-components: ${components ? '✅' : '❌'}`));
      console.log(chalk.gray(`  - Tests: ${test ? '✅' : '❌'}`));
      
      await createResource(type as any, name, config, resourceOptions);
      
      rl.close();
    });

  // Examples subcommand
  mistral
    .command('examples')
    .description('Show Mistral AI resource creation examples')
    .action(() => {
      showResourceCreationExample();
      rl.close();
    });

  // Status subcommand
  mistral
    .command('status')
    .description('Show Mistral AI configuration status')
    .action(async () => {
      const config = await setupConfiguration(rl);
      
      console.log(chalk.blue('\n🤖 Mistral AI Configuration Status:'));
      console.log(`  ${chalk.gray('AI Enabled:')} ${config.aiEnabled ? '✅' : '❌'}`);
      console.log(`  ${chalk.gray('AI Provider:')} ${config.aiProvider || 'Not set'}`);
      console.log(`  ${chalk.gray('AI Model:')} ${config.aiModel || 'Not set'}`);
      console.log(`  ${chalk.gray('Mistral API Key:')} ${process.env.MISTRAL_API_KEY ? '✅ Set' : '❌ Not found'}`);
      
      if (config.aiProvider === 'mistral' && process.env.MISTRAL_API_KEY) {
        console.log(chalk.green('\n✅ Mistral AI is ready to use!'));
        console.log(chalk.gray('Try: yarn re mistral create component MyComponent --functionality "display user data"'));
      } else {
        console.log(chalk.yellow('\n⚠️ Mistral AI needs configuration:'));
        console.log(chalk.gray('1. Run: yarn re ai enable --provider mistral'));
        console.log(chalk.gray('2. Add MISTRAL_API_KEY to your .env file'));
        console.log(chalk.gray('3. Run: yarn re add @mistralai/mistralai'));
      }
      
      rl.close();
    });
}
