import { Command } from 'commander';
import { Interface } from 'readline';
import { CommandInfo, commandRegistry } from '../../utils/commandRegistery/CommandRegistry';
import { spawn } from 'child_process';

/**
 * Helper class to register existing commands with the interactive system
 */
export class CommandRegistrar {
  
  /**
   * Execute a CLI command as subprocess and wait for completion
   */
  private static async executeCliCommand(command: string, args: string[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      const child = spawn('node', ['dist/index.js', command, ...args], {
        stdio: 'inherit',
        cwd: process.cwd()
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Command failed with exit code ${code}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Register all main commands with the interactive system
   */
  static registerMainCommands(program: Command, rl: Interface) {
    // Libraries command
    // commandRegistry.registerCommand({
    //   name: 'libraries',
    //   description: 'Install and setup additional libraries',
    //   category: 'main',
    //   action: async () => {
    //     await this.executeCliCommand('libraries', ['-i']);
    //   }
    // });

    // Global command
    commandRegistry.registerCommand({
      name: 'global',
      description: 'Create multiple global resources',
      category: 'main',
      action: async () => {
        await this.executeCliCommand('global', ['-i']);
      }
    });

    // Config command
    commandRegistry.registerCommand({
      name: 'config',
      description: 'Show current configuration',
      category: 'main',
      action: async () => {
        await this.executeCliCommand('config');
      }
    });

    // Init command
    commandRegistry.registerCommand({
      name: 'init',
      description: 'Initialize project configuration',
      category: 'main',
      action: async () => {
        await this.executeCliCommand('init');
      }
    });

    // Help command
    commandRegistry.registerCommand({
      name: 'help',
      description: 'Show help documentation',
      category: 'main',
      action: async () => {
        await this.executeCliCommand('help');
      }
    });

    // Dependencies command
    commandRegistry.registerCommand({
      name: 'deps',
      description: 'Manage project dependencies',
      category: 'main',
      action: async () => {
        await this.executeCliCommand('deps');
      }
    });

    // Add command
    commandRegistry.registerCommand({
      name: 'add',
      description: 'Add libraries to your React project',
      alias: '+',
      category: 'main',
      action: async () => {
        await this.executeAddCommand();
      }
    });

    // Generate command with sub-commands
    const generateSubCommands: CommandInfo[] = [
      { name: 'component', description: 'Generate a React component', action: async () => { await this.executeGenerateCommand('component'); } },
      { name: 'hook', description: 'Generate a custom React hook', action: async () => { await this.executeGenerateCommand('hook'); } },
      { name: 'page', description: 'Generate a page component', action: async () => { await this.executeGenerateCommand('page'); } },
      { name: 'util', description: 'Generate a utility function', action: async () => { await this.executeGenerateCommand('util'); } },
      { name: 'type', description: 'Generate TypeScript types', action: async () => { await this.executeGenerateCommand('type'); } },
      { name: 'context', description: 'Generate React context', action: async () => { await this.executeGenerateCommand('context'); } },
      { name: 'redux', description: 'Generate Redux slice', action: async () => { await this.executeGenerateCommand('redux'); } },
      { name: 'service', description: 'Generate API service', action: async () => { await this.executeGenerateCommand('service'); } },
      { name: 'guard', description: 'Generate route guard', action: async () => { await this.executeGenerateCommand('guard'); } },
      { name: 'hoc', description: 'Generate Higher-Order Component', action: async () => { await this.executeGenerateCommand('hoc'); } },
      { name: 'routes', description: 'Generate routing configuration', action: async () => { await this.executeGenerateCommand('routes'); } },
      { name: 'serviceworker', description: 'Generate service worker', action: async () => { await this.executeGenerateCommand('serviceworker'); } },
      { name: 'env', description: 'Generate environment configuration', action: async () => { await this.executeGenerateCommand('env'); } },
      { name: 'testutils', description: 'Generate test utilities', action: async () => { await this.executeGenerateCommand('testutils'); } },
      { name: 'errorboundary', description: 'Generate error boundary component', action: async () => { await this.executeGenerateCommand('errorboundary'); } },
      { name: 'template', description: 'Generate from template', action: async () => { await this.executeGenerateTemplateCommand(); } }
    ];

    commandRegistry.registerCommand({
      name: 'generate',
      description: 'Generate code patterns and components',
      alias: 'g',
      category: 'main',
      hasSubCommands: true,
      subCommands: generateSubCommands
    });

    // Docs command
    commandRegistry.registerCommand({
      name: 'docs',
      description: 'Generate documentation',
      category: 'main',
      action: async () => {
        await this.executeCliCommand('docs', ['--interactive']);
      }
    });

    

    // Template command with sub-commands
    const templateSubCommands: CommandInfo[] = [
      { name: 'save', description: 'Save existing code as a template', action: async () => { await this.executeTemplateCommand('save'); } },
      { name: 'list', description: 'List all saved templates', action: async () => { await this.executeCliCommand('template', ['list']); } },
      { name: 'from', description: 'Generate from a template', action: async () => { await this.executeTemplateCommand('from'); } },
      { name: 'delete', description: 'Delete a template', action: async () => { await this.executeTemplateCommand('delete'); } }
    ];

    commandRegistry.registerCommand({
      name: 'template',
      description: 'Template management - save, list, and generate from templates',
      category: 'main',
      hasSubCommands: true,
      subCommands: templateSubCommands
    });
  }

  private static async executeGenerateCommand(subCommand: string): Promise<void> {
    try {
      const inquirer = (await import('inquirer')).default;
      
      // Ask for the name of the item to generate
      const { itemName } = await inquirer.prompt([
        {
          type: 'input',
          name: 'itemName',
          message: `Enter ${subCommand} name:`,
          validate: (input: string) => {
            if (!input.trim()) {
              return 'Name is required';
            }
            return true;
          }
        }
      ]);

      // Execute the generate command with the name and interactive flag
      await this.executeCliCommand('g', [subCommand, itemName.trim(), '-i']);
    } catch (error) {
      const chalk = (await import('chalk')).default;
      console.error(chalk.red('Error executing generate command:'), error);
    }
  }

  private static async executeGenerateTemplateCommand(): Promise<void> {
    try {
      // For template generation, we want to work like normal `yarn re g template -i`
      // This should show template selection first, then ask for name
      await this.executeCliCommand('g', ['template', '-i']);
    } catch (error) {
      const chalk = (await import('chalk')).default;
      console.error(chalk.red('Error executing generate template command:'), error);
    }
  }

  private static async executeTemplateCommand(subCommand: string): Promise<void> {
    try {
      const inquirer = (await import('inquirer')).default;
      
      if (subCommand === 'save') {
        // Template save - ask for source path and template name
        const answers = await inquirer.prompt([
          {
            type: 'input',
            name: 'sourcePath',
            message: 'Enter source path to save as template:',
            validate: (input: string) => {
              if (!input.trim()) {
                return 'Source path is required';
              }
              return true;
            }
          },
          {
            type: 'input',
            name: 'templateName',
            message: 'Enter template name:',
            validate: (input: string) => {
              if (!input.trim()) {
                return 'Template name is required';
              }
              return true;
            }
          }
        ]);

        await this.executeCliCommand('template', ['save', answers.sourcePath.trim(), answers.templateName.trim(), '-i']);
        
      } else if (subCommand === 'from') {
        // Get available templates for selection
        const templates = await this.getAvailableTemplates();
        
        if (templates.length === 0) {
          const chalk = (await import('chalk')).default;
          console.log(chalk.yellow('No templates found.'));
          console.log(chalk.cyan('Create your first template with: yarn re template save'));
          return;
        }

        // Template from - select template and enter new name
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'templateName',
            message: 'Select a template:',
            choices: templates.map(template => ({
              name: `${template.name} - ${template.description || 'No description'}`,
              value: template.name
            }))
          },
          {
            type: 'input',
            name: 'newName',
            message: 'Enter new feature name:',
            validate: (input: string) => {
              if (!input.trim()) {
                return 'New name is required';
              }
              return true;
            }
          }
        ]);

        await this.executeCliCommand('template', ['from', answers.templateName.trim(), answers.newName.trim(), '-i']);
        
      } else if (subCommand === 'delete') {
        // Get available templates for selection
        const templates = await this.getAvailableTemplates();
        
        if (templates.length === 0) {
          const chalk = (await import('chalk')).default;
          console.log(chalk.yellow('No templates found to delete.'));
          return;
        }

        // Template delete - select template to delete
        const { templateName } = await inquirer.prompt([
          {
            type: 'list',
            name: 'templateName',
            message: 'Select template to delete:',
            choices: templates.map(template => ({
              name: `${template.name} - ${template.description || 'No description'}`,
              value: template.name
            }))
          }
        ]);

        await this.executeCliCommand('template', ['delete', templateName.trim()]);
      }
    } catch (error) {
      const chalk = (await import('chalk')).default;
      console.error(chalk.red(`Error executing template ${subCommand} command:`), error);
    }
  }

  /**
   * Get list of available templates
   */
  private static async getAvailableTemplates(): Promise<Array<{name: string, description?: string}>> {
    try {
      // Import the template utilities
      const { listTemplates } = await import('../../utils/template/template' as any);
      const templates = listTemplates();
      
      return templates.map((template: { name: any; metadata: { description: any; }; }) => ({
        name: template.name,
        description: template.metadata?.description
      }));
    } catch (error) {
      const chalk = (await import('chalk')).default;
      console.error(chalk.red('Error loading templates:'), error);
      return [];
    }
  }

  private static async executeAddCommand(): Promise<void> {
    try {
      const inquirer = (await import('inquirer')).default;
      
      // Show available pre-configured libraries and allow custom input
      const { libraryChoice } = await inquirer.prompt([
        {
          type: 'list',
          name: 'libraryChoice',
          message: 'What would you like to add?',
          choices: [
            { name: 'react-router-dom - React Router for navigation', value: 'react-router-dom' },
            { name: 'tailwindcss - Utility-first CSS framework', value: 'tailwindcss' },
            { name: 'styled-components - CSS-in-JS library', value: 'styled-components' },
            { name: 'zustand - Small, fast state management', value: 'zustand' },
            { name: 'react-query - Data fetching and caching library', value: 'react-query' },
            { name: 'axios - HTTP client library', value: 'axios' },
            { name: 'framer-motion - Animation library for React', value: 'framer-motion' },
            { name: 'material-ui - Material Design components', value: 'material-ui' },
            { name: 'react-icons - Popular icon libraries', value: 'react-icons' },
            new inquirer.Separator(),
            { name: 'Custom library (enter name manually)', value: 'custom' },
            new inquirer.Separator(),
            { name: 'List all available libraries', value: 'list' }
          ]
        }
      ]);

      if (libraryChoice === 'list') {
        await this.executeCliCommand('add', ['list']);
        return;
      }

      let libraryName = libraryChoice;
      
      if (libraryChoice === 'custom') {
        const { customLibrary } = await inquirer.prompt([
          {
            type: 'input',
            name: 'customLibrary',
            message: 'Enter library name:',
            validate: (input: string) => {
              if (!input.trim()) {
                return 'Library name is required';
              }
              return true;
            }
          }
        ]);
        libraryName = customLibrary.trim();
      }

      // Ask if it should be installed as dev dependency
      const { isDev } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'isDev',
          message: 'Install as dev dependency?',
          default: false
        }
      ]);

      // Execute the add command
      const args = [libraryName];
      if (isDev) {
        args.push('--dev');
      }
      
      await this.executeCliCommand('add', args);
    } catch (error) {
      const chalk = (await import('chalk')).default;
      console.error(chalk.red('Error executing add command:'), error);
    }
  }
}