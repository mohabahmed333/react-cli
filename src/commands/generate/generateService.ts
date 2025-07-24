import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { setupConfiguration } from '../../utils/config';
import { askQuestion } from '../../utils/prompt';
import { createFile, createFolder } from '../../utils/file';

function findFoldersByName(baseDir: string, folderName: string): string[] {
  const results: string[] = [];
  function search(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (entry.name.toLowerCase() === folderName.toLowerCase()) {
          results.push(path.join(dir, entry.name));
        }
        search(path.join(dir, entry.name));
      }
    }
  }
  search(baseDir);
  return results;
}

export function registerGenerateService(generate: Command, rl: any) {
  generate
    .command('service [name] [folder]')
    .description('Generate a service file for API calls (optionally in a specific folder under app/)')
    .option('--ts', 'Override TypeScript setting')
    .option('-i, --interactive', 'Use interactive mode for service and folder selection')
    .action(async (name: string | undefined, folder: string | undefined, options: any) => {
      const config = await setupConfiguration(rl);
      const useTS = options.ts ?? config.typescript;
      let serviceName = name;
      let targetDir: string | undefined = undefined;
      if (options.interactive) {
        // 1. Prompt for service name
        serviceName = (await askQuestion(rl, chalk.blue('Enter service name (camelCase): '))) || '';
        if (!/^[a-z][a-zA-Z0-9]*$/.test(serviceName)) {
          console.log(chalk.red('❌ Service name must be camelCase and start with a lowercase letter'));
          rl.close();
          return;
        }
        // 2. Ask if user wants to add to a specific folder
        const useFolder = await askQuestion(rl, chalk.blue('Add to a specific folder under app/? (y/n): '));
        if (useFolder.toLowerCase() === 'y') {
          // 3. Prompt for folder name
          const folderName = await askQuestion(rl, chalk.blue('Enter folder name: '));
          if (!folderName) {
            console.log(chalk.red('❌ Folder name required.'));
            rl.close();
            return;
          }
          if (folderName.includes('/') || folderName.includes('\\')) {
            targetDir = path.join(config.baseDir, folderName);
          } else {
            const baseSearch = path.join(process.cwd(), 'app');
            const matches = findFoldersByName(baseSearch, folderName);
            if (matches.length === 0) {
              const createNew = await askQuestion(rl, chalk.yellow(`No folder named "${folderName}" found under app/. Create it? (y/n): `));
              if (createNew.toLowerCase() !== 'y') {
                console.log(chalk.yellow('⏩ Service creation cancelled'));
                rl.close();
                return;
              }
              targetDir = path.join(baseSearch, folderName);
              fs.mkdirSync(targetDir, { recursive: true });
              console.log(chalk.green(`📁 Created directory: ${targetDir}`));
            } else if (matches.length === 1) {
              targetDir = matches[0];
            } else {
              let chosen = matches[0];
              console.log(chalk.yellow('Multiple folders found:'));
              matches.forEach((m, i) => console.log(`${i + 1}: ${m}`));
              const idx = await askQuestion(rl, chalk.blue('Select folder number: '));
              const num = parseInt(idx, 10);
              if (!isNaN(num) && num >= 1 && num <= matches.length) {
                chosen = matches[num - 1];
              } else {
                console.log(chalk.red('Invalid selection. Service creation cancelled.'));
                rl.close();
                return;
              }
              targetDir = chosen;
            }
          }
        } else {
          targetDir = path.join(config.baseDir, 'services');
        }
        await createServiceInPath(serviceName, targetDir, useTS);
        rl.close();
        return;
      }
      // Non-interactive mode (legacy)
      if (!serviceName) {
        console.log(chalk.red('❌ Service name is required.'));
        rl.close();
        return;
      }
      if (!/^[a-z][a-zA-Z0-9]*$/.test(serviceName)) {
        console.log(chalk.red('❌ Service name must be camelCase and start with a lowercase letter'));
        rl.close();
        return;
      }
      if (folder) {
        if (folder.includes('/') || folder.includes('\\')) {
          targetDir = path.join(config.baseDir, folder);
        } else {
          const baseSearch = path.join(process.cwd(), 'app');
          const matches = findFoldersByName(baseSearch, folder);
          if (matches.length === 0) {
            console.log(chalk.red(`❌ No folder named "${folder}" found under app/. Use -i to create interactively.`));
            rl.close();
            return;
          } else if (matches.length === 1) {
            targetDir = matches[0];
          } else {
            targetDir = matches[0]; // Default to first match
          }
        }
        await createServiceInPath(serviceName, targetDir, useTS);
      } else {
        targetDir = path.join(config.baseDir, 'services');
        await createServiceInPath(serviceName, targetDir, useTS);
      }
      rl.close();
    });
}

async function createServiceInPath(serviceName: string, fullPath: string, useTS: boolean) {
  try {
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(chalk.green(`📁 Created directory: ${fullPath}`));
    }
    const serviceFilePath = path.join(fullPath, `${serviceName}Service.${useTS ? 'ts' : 'js'}`);
    if (fs.existsSync(serviceFilePath)) {
      console.log(chalk.yellow(`⚠️ Service file already exists: ${serviceFilePath}`));
      return;
    }
    const content = useTS
      ? `// If using Node.js < 18, install 'node-fetch' and import it here:\n// import fetch from 'node-fetch';\n\nexport const ${serviceName}Service = {\n  async fetchData(url: string): Promise<any> {\n    const response = await fetch(url);\n    if (!response.ok) {\n      throw new Error(\`HTTP error! status: \${response.status}\`);\n    }\n    return await response.json();\n  },\n  // Add more API methods here\n};\n`
      : `// If using Node.js < 18, install 'node-fetch' and import it here:\n// import fetch from 'node-fetch';\n\nexport const ${serviceName}Service = {\n  async fetchData(url) {\n    const response = await fetch(url);\n    if (!response.ok) {\n      throw new Error(\`HTTP error! status: \${response.status}\`);\n    }\n    return await response.json();\n  },\n  // Add more API methods here\n};\n`;
    fs.writeFileSync(serviceFilePath, content);
    console.log(chalk.green(`✅ Created service: ${serviceFilePath}`));
  } catch (error: any) {
    console.log(chalk.red(`❌ Error creating service:`));
    console.error(chalk.red(error.message));
    if (error.code === 'ENOENT') {
      console.log(chalk.yellow('💡 Check that parent directories exist and are writable'));
    } else if (error.code === 'EACCES') {
      console.log(chalk.yellow('💡 You might need permission to write to this directory'));
    }
  }
} 