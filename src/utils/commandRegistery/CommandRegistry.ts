import { Command } from 'commander';

export interface CommandInfo {
  name: string;
  description: string;
  category?: string;
  alias?: string;
  hasSubCommands?: boolean;
  subCommands?: CommandInfo[];
  action?: () => Promise<void> | void;
  commandInstance?: Command;
}

export class CommandRegistry {
  private commands: Map<string, CommandInfo> = new Map();
  private categories: Map<string, CommandInfo[]> = new Map();

  registerCommand(commandInfo: CommandInfo) {
    this.commands.set(commandInfo.name, commandInfo);
    
    if (commandInfo.category) {
      if (!this.categories.has(commandInfo.category)) {
        this.categories.set(commandInfo.category, []);
      }
      this.categories.get(commandInfo.category)!.push(commandInfo);
    }
  }

  getCommand(name: string): CommandInfo | undefined {
    return this.commands.get(name);
  }

  getAllCommands(): CommandInfo[] {
    return Array.from(this.commands.values());
  }

  getCommandsByCategory(category: string): CommandInfo[] {
    return this.categories.get(category) || [];
  }

  getAllCategories(): string[] {
    return Array.from(this.categories.keys());
  }

  getMainCommands(): CommandInfo[] {
    return this.getAllCommands().filter(cmd => !cmd.category || cmd.category === 'main');
  }
}

export const commandRegistry = new CommandRegistry();