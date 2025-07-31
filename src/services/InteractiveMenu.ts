import inquirer from 'inquirer';
import chalk from 'chalk';
import { CommandInfo, commandRegistry } from './CommandRegistry';

export class InteractiveMenu {
  private currentPath: string[] = [];

  async showMainMenu(): Promise<void> {
    console.clear();
    console.log(chalk.cyan.bold('🚀 React CLI - Interactive Command Selection'));
    console.log(chalk.gray('═'.repeat(50)));
    
    const commands = commandRegistry.getMainCommands();
    const choices = [
      ...commands.map(cmd => ({
        name: `${chalk.cyan(cmd.name)} ${cmd.alias ? chalk.gray(`(${cmd.alias})`) : ''} - ${cmd.description}`,
        value: cmd.name,
        short: cmd.name
      })),
      new inquirer.Separator(),
      {
        name: chalk.red('❌ Exit'),
        value: 'exit',
        short: 'Exit'
      }
    ];

    const { selectedCommand } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedCommand',
        message: 'Select a command:',
        choices,
        pageSize: 15
      }
    ]);

    if (selectedCommand === 'exit') {
      console.log(chalk.yellow('👋 Goodbye!'));
      process.exit(0);
    }

    await this.handleCommandSelection(selectedCommand);
  }

  async handleCommandSelection(commandName: string): Promise<void> {
    const command = commandRegistry.getCommand(commandName);
    
    if (!command) {
      console.log(chalk.red(`Command "${commandName}" not found.`));
      await this.askToContinue();
      return this.showMainMenu();
    }

    if (command.hasSubCommands && command.subCommands) {
      await this.showSubCommandMenu(command);
    } else if (command.action) {
      console.log(chalk.cyan(`\n🔄 Executing: ${command.name}`));
      console.log(chalk.gray('─'.repeat(30)));
      try {
        await command.action();
        console.log(chalk.green('\n✅ Command completed successfully!'));
        process.exit(0);
      } catch (error) {
        console.error(chalk.red('Error executing command:'), error);
        await this.askToContinue();
        return this.showMainMenu();
      }
    } else {
      console.log(chalk.yellow(`Command "${commandName}" has no action defined.`));
      await this.askToContinue();
      return this.showMainMenu();
    }
  }

  async showSubCommandMenu(parentCommand: CommandInfo): Promise<void> {
    console.clear();
    console.log(chalk.cyan.bold(`🚀 ${parentCommand.name} - Sub Commands`));
    console.log(chalk.gray('═'.repeat(50)));
    
    const choices = [
      ...parentCommand.subCommands!.map(cmd => ({
        name: `${chalk.cyan(cmd.name)} - ${cmd.description}`,
        value: cmd.name,
        short: cmd.name
      })),
      new inquirer.Separator(),
      {
        name: chalk.yellow('⬅️  Back to Main Menu'),
        value: 'back',
        short: 'Back'
      },
      {
        name: chalk.red('❌ Exit'),
        value: 'exit',
        short: 'Exit'
      }
    ];

    const { selectedSubCommand } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedSubCommand',
        message: `Select a ${parentCommand.name} command:`,
        choices,
        pageSize: 15
      }
    ]);

    if (selectedSubCommand === 'exit') {
      console.log(chalk.yellow('👋 Goodbye!'));
      process.exit(0);
    }

    if (selectedSubCommand === 'back') {
      return this.showMainMenu();
    }

    const subCommand = parentCommand.subCommands!.find(cmd => cmd.name === selectedSubCommand);
    if (subCommand && subCommand.action) {
      console.log(chalk.cyan(`\n🔄 Executing: ${parentCommand.name} ${subCommand.name}`));
      console.log(chalk.gray('─'.repeat(30)));
      try {
        await subCommand.action();
        console.log(chalk.green('\n✅ Command completed successfully!'));
        process.exit(0);
      } catch (error) {
        console.error(chalk.red('Error executing command:'), error);
        await this.askToContinue();
        return this.showSubCommandMenu(parentCommand);
      }
    } else {
      console.log(chalk.yellow(`Sub-command "${selectedSubCommand}" has no action defined.`));
      await this.askToContinue();
      return this.showSubCommandMenu(parentCommand);
    }
  }

  private async askToContinue(): Promise<void> {
    console.log('\n');
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: chalk.gray('Press Enter to continue...'),
      }
    ]);
  }

  async showSearchMenu(): Promise<void> {
    const allCommands = commandRegistry.getAllCommands();
    const { searchTerm } = await inquirer.prompt([
      {
        type: 'input',
        name: 'searchTerm',
        message: 'Search commands:',
      }
    ]);

    const filteredCommands = allCommands.filter(cmd => 
      cmd.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cmd.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filteredCommands.length === 0) {
      console.log(chalk.yellow('No commands found matching your search.'));
      await this.askToContinue();
      return this.showMainMenu();
    }

    const choices = [
      ...filteredCommands.map(cmd => ({
        name: `${chalk.cyan(cmd.name)} - ${cmd.description}`,
        value: cmd.name,
        short: cmd.name
      })),
      new inquirer.Separator(),
      {
        name: chalk.yellow('⬅️  Back to Main Menu'),
        value: 'back',
        short: 'Back'
      }
    ];

    const { selectedCommand } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedCommand',
        message: 'Select a command:',
        choices,
        pageSize: 10
      }
    ]);

    if (selectedCommand === 'back') {
      return this.showMainMenu();
    }

    await this.handleCommandSelection(selectedCommand);
  }
}

export const interactiveMenu = new InteractiveMenu();