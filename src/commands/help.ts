import { Command } from 'commander';
import chalk from 'chalk';
import readline from 'readline';

export function handleHelp(program: Command, rl: readline.Interface) {
  program
    .command('help')
    .description('Show help')
    .action(() => {
      console.log(chalk.cyan.bold('\n📘 CLI Documentation'));
      console.log('\nCommands:');
      console.log('  hook <name>       Create a custom hook');
      console.log('  util <name>       Create a utility function');
      console.log('  type <name>       Create TypeScript types');
      console.log('  global            Create multiple global resources');
      console.log('  page <name>       Create a page with components');
      console.log('  init              Initialize project config');
      console.log('  config            Show current config');
      console.log('\nOptions:');
      console.log('  --ts              Override TypeScript setting');
      console.log('  --interactive     Use interactive mode');
      console.log('\nExamples:');
      console.log('  create-page hook useAuth --ts');
      console.log('  create-page page Dashboard --css --test --interactive');
      console.log('  create-page global --interactive');
      rl.close();
    });
}
