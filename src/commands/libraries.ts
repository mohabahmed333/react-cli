import { Command } from 'commander';
import { Interface } from 'readline';
import chalk from 'chalk';
import * as fs from 'fs-extra';
import * as path from 'path';
import { execa } from 'execa';
import inquirer from 'inquirer';

import libraries from '../libraries/registry';

async function setupLibraries(projectPath: string, selectedLibraries: string[]) {
  // Install all packages at once for better performance
  const allPackages = selectedLibraries
    .map(lib => libraries[lib]?.packages || '')
    .join(' ')
    .split(' ')
    .filter(pkg => pkg);

  const allDevPackages = selectedLibraries
    .map(lib => libraries[lib]?.devPackages || '')
    .join(' ')
    .split(' ')
    .filter(pkg => pkg);

  if (allPackages.length > 0) {
    console.log(chalk.cyan('Installing main dependencies...'));
    await execa('npm', ['install', ...allPackages], { cwd: projectPath });
  }

  if (allDevPackages.length > 0) {
    console.log(chalk.cyan('Installing dev dependencies...'));
    await execa('npm', ['install', '-D', ...allDevPackages], { cwd: projectPath });
  }

  // Run individual library setups
  for (const lib of selectedLibraries) {
    const config = libraries[lib];
    if (!config) continue;

    console.log(chalk.cyan(`Configuring ${lib}...`));
    const isTypeScript = fs.existsSync(path.join(projectPath, 'tsconfig.json'));
    await config.setup(projectPath, isTypeScript);
  }
}

export async function handleLibraries(program: Command, rl: Interface) {
  program
    .command('libraries')
    .description('Install and setup additional libraries')
    .option('-p, --path <path>', 'Project path', process.cwd())
    .action(async (options) => {
      try {
        const { selectedLibraries } = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'selectedLibraries',
            message: 'Select additional libraries to install:',
            choices: Object.keys(libraries),
          }
        ]);

        if (selectedLibraries.length > 0) {
          await setupLibraries(options.path, selectedLibraries);
          console.log(chalk.green('✅ Libraries installed and configured successfully!'));
        } else {
          console.log(chalk.yellow('No libraries selected.'));
        }
      } catch (error) {
        console.error(chalk.red('Error setting up libraries:'), error);
      } finally {
        rl.close();
      }
    });
}
