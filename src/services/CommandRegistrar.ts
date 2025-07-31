import { Command } from 'commander';
import { Interface } from 'readline';
import { CommandInfo, commandRegistry } from './CommandRegistry';
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
    commandRegistry.registerCommand({
      name: 'libraries',
      description: 'Install and setup additional libraries',
      category: 'main',
      action: async () => {
        await this.executeCliCommand('libraries', ['--interactive']);
      }
    });

    // Global command
    commandRegistry.registerCommand({
      name: 'global',
      description: 'Create multiple global resources',
      category: 'main',
      action: async () => {
        await this.executeCliCommand('global', ['--interactive']);
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
      { name: 'template', description: 'Generate from template', action: async () => { await this.executeGenerateCommand('template'); } }
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

    // AI command
    commandRegistry.registerCommand({
      name: 'ai',
      description: 'AI-powered code generation and assistance',
      category: 'main',
      action: async () => {
        await this.executeCliCommand('ai', ['--interactive']);
      }
    });

    // Template command
    commandRegistry.registerCommand({
      name: 'template',
      description: 'Template management commands',
      category: 'main',
      action: async () => {
        await this.executeCliCommand('template', ['--interactive']);
      }
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
      await this.executeCliCommand('g', [subCommand, itemName.trim(), '--interactive']);
    } catch (error) {
      const chalk = (await import('chalk')).default;
      console.error(chalk.red('Error executing generate command:'), error);
    }
  }
}