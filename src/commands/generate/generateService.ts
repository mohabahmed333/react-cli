import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { setupConfiguration } from '../../utils/config';
import { askQuestion } from '../../utils/prompt';
import { createFile } from '../../utils/file';
import { 
  shouldUseAI, 
  generateServiceWithAI, 
  getAIFeatures, 
  confirmAIOutput 
} from '../../utils/generateAIHelper';

export function registerGenerateService(generate: Command, rl: any) {
  generate
    .command('service [name]')
    .description('Generate a service for API calls')
    .option('--ts', 'Generate as TypeScript')
    .option('--crud', 'Include CRUD operations')
    .option('--axios', 'Use Axios for HTTP requests')
    .option('--replace', 'Replace file if it exists')
    .option('-i, --interactive', 'Use interactive mode')
    .option('--ai', 'Use AI to generate the service code')
    .action(async (name: string | undefined, options: any) => {
      try {
        console.log(chalk.cyan('\n🔧 Service Generator'));
        console.log(chalk.dim('======================'));

        const config = await setupConfiguration(rl);
        const useTS = options.ts ?? config.typescript;
        let serviceName = name;
        let useAI = false;
        let aiFeatures = '';
        let useCrud = options.crud;
        let useAxios = options.axios;

        if (options.interactive) {
          // Get service name
          serviceName = (await askQuestion(rl, chalk.blue('Enter service name (PascalCase): '))) || '';
          if (!/^[A-Z][a-zA-Z0-9]*$/.test(serviceName)) {
            console.log(chalk.red('❌ Service name must be PascalCase and start with a capital letter'));
            return;
          }

          // Ask about AI usage if enabled
          if (config.aiEnabled) {
            useAI = await shouldUseAI(rl, options, config);
            if (useAI) {
              console.log(chalk.cyan('\n📝 Service Configuration'));
              useCrud = (await askQuestion(rl, chalk.blue('Include CRUD operations? (y/n): '))) === 'y';
              useAxios = (await askQuestion(rl, chalk.blue('Use Axios for HTTP requests? (y/n): '))) === 'y';
              
              console.log(chalk.cyan('\nDescribe additional features (e.g., "authentication, error handling, request caching"):'));
              aiFeatures = await getAIFeatures(rl, 'Service');
            }
          }

          // If not using AI, ask about basic options
          if (!useAI) {
            useCrud = (await askQuestion(rl, chalk.blue('Include CRUD operations? (y/n): '))) === 'y';
            useAxios = (await askQuestion(rl, chalk.blue('Use Axios for HTTP requests? (y/n): '))) === 'y';
          }
        } else {
          if (!serviceName) {
            console.log(chalk.red('❌ Service name is required.'));
            return;
          }
          if (!/^[A-Z][a-zA-Z0-9]*$/.test(serviceName)) {
            console.log(chalk.red('❌ Service name must be PascalCase and start with a capital letter'));
            return;
          }

          useAI = await shouldUseAI(rl, options, config);
        }

        // Create service
        await createService(
          serviceName,
          useTS,
          { ...options, useAI, aiFeatures, useCrud, useAxios },
          config,
          rl
        );

        console.log(chalk.green('\n✨ Service generation complete!'));
        console.log(chalk.dim('======================\n'));
      } catch (error) {
        console.error(chalk.red('\n❌ Error:'), error instanceof Error ? error.message : 'Unknown error');
      } finally {
        rl.close();
      }
    });
}

async function createService(
  name: string,
  useTS: boolean,
  options: any,
  config: any,
  rl: any
) {
  try {
    const servicesDir = path.join(config.baseDir, 'services');
    if (!fs.existsSync(servicesDir)) {
      fs.mkdirSync(servicesDir, { recursive: true });
      console.log(chalk.green(`📁 Created services directory: ${servicesDir}`));
    }

    const ext = useTS ? '.ts' : '.js';
    const filePath = path.join(servicesDir, `${name}Service${ext}`);

    let serviceContent = '';
    if (options.useAI && config) {
      const aiContent = await generateServiceWithAI(name, config, {
        features: options.aiFeatures,
        crud: options.useCrud,
        axios: options.useAxios
      });

      if (aiContent && (!fs.existsSync(filePath) || options.replace)) {
        if (await confirmAIOutput(rl, aiContent)) {
          serviceContent = aiContent;
        }
      }
    }

    if (!serviceContent) {
      // Generate default service content
      const axiosImport = options.useAxios ? "import axios from 'axios';\n\n" : '';
      const baseUrl = '`${process.env.API_URL}/api`';

      if (useTS) {
        serviceContent = `${axiosImport}interface ${name}Data {
  id: string;
  // Add other properties
}

export class ${name}Service {
  private baseUrl = ${baseUrl};
  ${options.useAxios ? `private client = axios.create();` : ''}

  ${options.useCrud ? `
  async getAll(): Promise<${name}Data[]> {
    ${options.useAxios
      ? `const response = await this.client.get(\`\${this.baseUrl}/${name.toLowerCase()}s\`);
    return response.data;`
      : `const response = await fetch(\`\${this.baseUrl}/${name.toLowerCase()}s\`);
    return response.json();`}
  }

  async getById(id: string): Promise<${name}Data> {
    ${options.useAxios
      ? `const response = await this.client.get(\`\${this.baseUrl}/${name.toLowerCase()}s/\${id}\`);
    return response.data;`
      : `const response = await fetch(\`\${this.baseUrl}/${name.toLowerCase()}s/\${id}\`);
    return response.json();`}
  }

  async create(data: Omit<${name}Data, 'id'>): Promise<${name}Data> {
    ${options.useAxios
      ? `const response = await this.client.post(\`\${this.baseUrl}/${name.toLowerCase()}s\`, data);
    return response.data;`
      : `const response = await fetch(\`\${this.baseUrl}/${name.toLowerCase()}s\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();`}
  }

  async update(id: string, data: Partial<${name}Data>): Promise<${name}Data> {
    ${options.useAxios
      ? `const response = await this.client.put(\`\${this.baseUrl}/${name.toLowerCase()}s/\${id}\`, data);
    return response.data;`
      : `const response = await fetch(\`\${this.baseUrl}/${name.toLowerCase()}s/\${id}\`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();`}
  }

  async delete(id: string): Promise<void> {
    ${options.useAxios
      ? `await this.client.delete(\`\${this.baseUrl}/${name.toLowerCase()}s/\${id}\`);`
      : `await fetch(\`\${this.baseUrl}/${name.toLowerCase()}s/\${id}\`, {
      method: 'DELETE'
    });`}
  }` : ''}
}`;
      } else {
        serviceContent = `${axiosImport}export class ${name}Service {
  constructor() {
    this.baseUrl = ${baseUrl};
    ${options.useAxios ? 'this.client = axios.create();' : ''}
  }

  ${options.useCrud ? `
  async getAll() {
    ${options.useAxios
      ? `const response = await this.client.get(\`\${this.baseUrl}/${name.toLowerCase()}s\`);
    return response.data;`
      : `const response = await fetch(\`\${this.baseUrl}/${name.toLowerCase()}s\`);
    return response.json();`}
  }

  async getById(id) {
    ${options.useAxios
      ? `const response = await this.client.get(\`\${this.baseUrl}/${name.toLowerCase()}s/\${id}\`);
    return response.data;`
      : `const response = await fetch(\`\${this.baseUrl}/${name.toLowerCase()}s/\${id}\`);
    return response.json();`}
  }

  async create(data) {
    ${options.useAxios
      ? `const response = await this.client.post(\`\${this.baseUrl}/${name.toLowerCase()}s\`, data);
    return response.data;`
      : `const response = await fetch(\`\${this.baseUrl}/${name.toLowerCase()}s\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();`}
  }

  async update(id, data) {
    ${options.useAxios
      ? `const response = await this.client.put(\`\${this.baseUrl}/${name.toLowerCase()}s/\${id}\`, data);
    return response.data;`
      : `const response = await fetch(\`\${this.baseUrl}/${name.toLowerCase()}s/\${id}\`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();`}
  }

  async delete(id) {
    ${options.useAxios
      ? `await this.client.delete(\`\${this.baseUrl}/${name.toLowerCase()}s/\${id}\`);`
      : `await fetch(\`\${this.baseUrl}/${name.toLowerCase()}s/\${id}\`, {
      method: 'DELETE'
    });`}
  }` : ''}
}`;
      }
    }

    if (createFile(filePath, serviceContent, options.replace)) {
      console.log(chalk.green(`✅ Created service: ${filePath}`));
    } else {
      console.log(chalk.yellow(`⚠️ Service exists: ${filePath} (use --replace to overwrite)`));
    }
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