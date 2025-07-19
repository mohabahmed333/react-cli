import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import readline from 'readline';

export function handleDeps(program: Command, rl: readline.Interface) {
  program
    .command('deps')
    .description('Check dependency versions')
    .action(async () => {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      const deps = packageJson.dependencies || {};
      const devDeps = packageJson.devDependencies || {};
      console.log(chalk.cyan.bold('\n📦 Dependencies:'));
      Object.entries(deps).forEach(([pkg, version]) => {
        console.log(`- ${pkg}: ${version}`);
      });
      if (Object.keys(devDeps).length) {
        console.log(chalk.cyan.bold('\n📦 Dev Dependencies:'));
        Object.entries(devDeps).forEach(([pkg, version]) => {
          console.log(`- ${pkg}: ${version}`);
        });
      }
      rl.close();
    });
}
