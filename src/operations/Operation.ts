import { Command } from 'commander';
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import { Interface as ReadlineInterface } from 'readline';
import { setupConfiguration } from '../utils/config';
import { detectApiLibrary } from '../utils/libraryDetication';
import { CrudOptions, generateCrudServices } from './crud/crud';

interface OperationOptions {
  api?: 'axios' | 'react-query' | 'rtk-query';
  errorHandler?: 'basic' | 'detailed' | 'toast';
  interactive?: boolean;
}

interface ResourcePrompt {
  resource: string;
}

interface FolderPrompt {
  folderChoice: string;
}

interface ApiPrompt {
  api: 'axios' | 'react-query' | 'rtk-query';
}

interface ErrorHandlerPrompt {
  error: 'basic' | 'detailed' | 'toast';
}

export function registerOperation(program: Command, rl: ReadlineInterface): void {
  program
    .command('operation [name] [folder]')
    .description('Generate TypeScript CRUD operations for a resource (optionally in a specific folder)')
    .option('-a, --api <type>', 'API approach (axios|react-query|rtk-query)')
    .option('-e, --error-handler <type>', 'Error handling approach (basic|detailed|toast)', 'detailed')
    .option('-i, --interactive', 'Use interactive mode for all options')
    .action(async (name: string | undefined, folder: string | undefined, options: OperationOptions) => { 
      try {
        const config = await setupConfiguration(rl);
        let resourceName = name;
        let apiType = options.api;
        let errorHandler = options.errorHandler;
        let targetFolder = folder;
        const baseDir = config.baseDir || 'src';
        const useTS = config.typescript;

        if (options.interactive) {
          // Prompt for resource name
          if (!resourceName) {
            const { resource } = await inquirer.prompt<ResourcePrompt>([{
              type: 'input',
              name: 'resource',
              message: 'Enter resource name:',
              validate: (input: string) => input ? true : 'Resource name is required.'
            }]);
            resourceName = resource;
          }

          // Prompt for folder
          if (!targetFolder) {
            const { folderChoice } = await inquirer.prompt<FolderPrompt>([{
              type: 'input',
              name: 'folderChoice',
              message: `Enter folder under ${baseDir} (leave blank for 'services'):`,
            }]);
            targetFolder = folderChoice || 'services';
          }

          // Prompt for API type
          if (!apiType) {
            const { api } = await inquirer.prompt<ApiPrompt>([{
              type: 'list',
              name: 'api',
              message: 'API approach:',
              choices: ['axios', 'react-query', 'rtk-query'],
            }]);
            apiType = api;
          }

          // Prompt for error handler
          if (!errorHandler) {
            const { error } = await inquirer.prompt<ErrorHandlerPrompt>([{
              type: 'list',
              name: 'error',
              message: 'Error handling approach:',
              choices: ['basic', 'detailed', 'toast'],
            }]);
            errorHandler = error;
          }
        }

        if (!resourceName) {
          console.error('Resource name is required.');
          return;
        }

        const detectedApi = await detectApiLibrary();
        apiType = apiType || (detectedApi as CrudOptions['api'] | undefined);
        if (!apiType) {
          console.error('No API library detected. Please install axios, @tanstack/react-query, or @reduxjs/toolkit first');
          return;
        }

        errorHandler = errorHandler || 'detailed';
        targetFolder = targetFolder || 'services';

        // Ensure the folder exists under baseDir
        const outputDir = path.join(process.cwd(), baseDir, targetFolder);
        await fs.ensureDir(outputDir);

        await generateCrudServices(resourceName, {
          api: apiType,
          typescript: useTS,
          errorHandler: errorHandler as CrudOptions['errorHandler'],
          outputDir,
          rl,
          interactive: options.interactive || false
        });
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error:', error.message);
        } else {
          console.error('An unknown error occurred');
        }
      }
    });
} 