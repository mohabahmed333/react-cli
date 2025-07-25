import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { createFile } from '../../utils/file';
import { generateServiceWithAI, confirmAIOutput, getAIFeatures, GenerateOptions } from '../../utils/generateAIHelper';
import type { CLIConfig } from '../../utils/config';
import { Interface as ReadlineInterface } from 'readline';
import { setupConfiguration } from '../../utils/config';

interface ServiceOptions extends GenerateOptions {
  crud?: boolean;
  api?: 'axios' | 'react-query' | 'rtk-query';
  errorHandler?: 'basic' | 'detailed' | 'toast';
  outputDir?: string;
  useAxios?: boolean;
  useCrud?: boolean;
}

export function registerGenerateService(generate: Command, rl: ReadlineInterface) {
  generate
    .command('service [name]')
    .description('Generate a new service')
    .option('--crud', 'Generate CRUD operations')
    .option('--api <type>', 'API integration type (axios/react-query/rtk-query)')
    .option('--error-handler <type>', 'Error handling type (basic/detailed/toast)')
    .option('--output <dir>', 'Output directory')
    .option('--replace', 'Replace existing files')
    .option('--ai', 'Use AI to generate code')
    .action(async (name: string | undefined, options: ServiceOptions) => {
      try {
        if (!name) {
          console.log(chalk.red('❌ Service name is required'));
          return;
        }

        const config = await setupConfiguration(rl);
        await handleService(name, options, config, rl);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error(chalk.red('Error:'), error.message);
        } else {
          console.error(chalk.red('Error:'), String(error));
        }
      }
    });
}

async function handleService(
  name: string,
  options: ServiceOptions,
  config: CLIConfig,
  rl: ReadlineInterface
) {
  try {
    const useTS = config.typescript;
    const serviceDir = path.join(config.baseDir, 'services');
    const filePath = path.join(serviceDir, `${name}Service.${useTS ? 'ts' : 'js'}`);

    if (!fs.existsSync(serviceDir)) {
      fs.mkdirSync(serviceDir, { recursive: true });
      console.log(chalk.green(`📁 Created directory: ${serviceDir}`));
    }

    let serviceContent = '';
    if (options.useAI && config) {
      const aiContent = await generateServiceWithAI(name, config, {
        features: options.features
      });

      if (aiContent && (!fs.existsSync(filePath) || options.replace)) {
        if (await confirmAIOutput(rl, aiContent)) {
          serviceContent = aiContent;
        }
      }
    }

    if (!serviceContent) {
      serviceContent = useTS
        ? `import axios from 'axios';\n\nexport interface ${name}Data {\n  // Define your data types here\n}\n\nexport class ${name}Service {\n  private baseUrl = '/api/${name.toLowerCase()}';\n\n  async getAll(): Promise<${name}Data[]> {\n    const response = await axios.get(this.baseUrl);\n    return response.data;\n  }\n\n  async getById(id: string): Promise<${name}Data> {\n    const response = await axios.get(\`\${this.baseUrl}/\${id}\`);\n    return response.data;\n  }\n\n  async create(data: ${name}Data): Promise<${name}Data> {\n    const response = await axios.post(this.baseUrl, data);\n    return response.data;\n  }\n\n  async update(id: string, data: Partial<${name}Data>): Promise<${name}Data> {\n    const response = await axios.put(\`\${this.baseUrl}/\${id}\`, data);\n    return response.data;\n  }\n\n  async delete(id: string): Promise<void> {\n    await axios.delete(\`\${this.baseUrl}/\${id}\`);\n  }\n}\n`
        : `import axios from 'axios';\n\nexport class ${name}Service {\n  constructor() {\n    this.baseUrl = '/api/${name.toLowerCase()}';\n  }\n\n  async getAll() {\n    const response = await axios.get(this.baseUrl);\n    return response.data;\n  }\n\n  async getById(id) {\n    const response = await axios.get(\`\${this.baseUrl}/\${id}\`);\n    return response.data;\n  }\n\n  async create(data) {\n    const response = await axios.post(this.baseUrl, data);\n    return response.data;\n  }\n\n  async update(id, data) {\n    const response = await axios.put(\`\${this.baseUrl}/\${id}\`, data);\n    return response.data;\n  }\n\n  async delete(id) {\n    await axios.delete(\`\${this.baseUrl}/\${id}\`);\n  }\n}\n`;
    }

    if (createFile(filePath, serviceContent, options.replace)) {
      console.log(chalk.green(`✅ Created service: ${filePath}`));
    } else {
      console.log(chalk.yellow(`⚠️ Service exists: ${filePath} (use --replace to overwrite)`));
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(chalk.red('Error:'), error.message);
      if ('code' in error) {
        const fsError = error as { code: string };
        if (fsError.code === 'ENOENT') {
          console.log(chalk.yellow('💡 Check that parent directories exist and are writable'));
        } else if (fsError.code === 'EACCES') {
          console.log(chalk.yellow('💡 You might need permission to write to this directory'));
        }
      }
    } else {
      console.error(chalk.red('Error:'), String(error));
    }
  }
} 