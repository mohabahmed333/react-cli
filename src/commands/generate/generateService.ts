import { Command } from 'commander';
import chalk from 'chalk';
import { setupConfiguration } from '../../utils/config';
import { askQuestion } from '../../utils/prompt';
import { createFile, createFolder } from '../../utils/file';

export function registerGenerateService(generate: Command, rl: any) {
  generate
    .command('service <name>')
    .description('Generate a service file for API calls')
    .option('--ts', 'Override TypeScript setting')
    .option('-i, --interactive', 'Use interactive mode')
    .action(async (name: string, options: any) => {
      const config = await setupConfiguration(rl);
      const useTS = options.ts ?? config.typescript;
      const serviceName = options.interactive
        ? (await askQuestion(rl, chalk.blue('Enter service name: '))) || name
        : name;
      const ext = useTS ? 'ts' : 'js';
      const folderPath = `${config.baseDir}/services`;
      createFolder(folderPath);
      const content = useTS
        ? `// If using Node.js < 18, install 'node-fetch' and import it here:\n// import fetch from 'node-fetch';\n\nexport const ${serviceName}Service = {\n  async fetchData(url: string): Promise<any> {\n    const response = await fetch(url);\n    if (!response.ok) {\n      throw new Error(\`HTTP error! status: \${response.status}\`);\n    }\n    return await response.json();\n  },\n  // Add more API methods here\n};\n`
        : `// If using Node.js < 18, install 'node-fetch' and import it here:\n// import fetch from 'node-fetch';\n\nexport const ${serviceName}Service = {\n  async fetchData(url) {\n    const response = await fetch(url);\n    if (!response.ok) {\n      throw new Error(\`HTTP error! status: \${response.status}\`);\n    }\n    return await response.json();\n  },\n  // Add more API methods here\n};\n`;
      const filePath = `${folderPath}/${serviceName}Service.${ext}`;
      if (createFile(filePath, content)) {
        console.log(chalk.green(`✅ Created service: ${filePath}`));
      } else {
        console.log(chalk.yellow(`⚠️ Service exists: ${filePath}`));
      }
      rl.close();
    });
} 