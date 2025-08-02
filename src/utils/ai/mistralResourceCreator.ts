import { generateCode } from '../../services/mistral-service';
import { createFile } from '../createGeneratedFile/file';
import path from 'path';
import type { CLIConfig } from '../config/config';
import chalk from 'chalk';

export interface ResourceOptions {
  functionality?: string;
  css?: boolean;
  components?: boolean;
  test?: boolean;
}

// AI prompt templates for different resource types
const prompts = {
  hook: (name: string, options: ResourceOptions = {}) => `Generate a custom React hook named use${name} that: 
    - ${options.functionality || 'provides reusable functionality'}
    - Returns typed values with TypeScript interfaces
    - Includes error handling
    - Follows React Hooks best practices
    - Includes JSDoc documentation`,

  util: (name: string, options: ResourceOptions = {}) => `Create a utility function named ${name} that:
    - Performs: ${options.functionality || 'a common data transformation'}
    - Is fully typed with TypeScript interfaces
    - Is pure and testable
    - Includes proper error handling
    - Has comprehensive JSDoc documentation`,

  type: (name: string, options: ResourceOptions = {}) => `Generate TypeScript types for ${name} including:
    - Core interface definition
    - Supporting utility types
    - API response shape types
    - State management types
    - Proper JSDoc documentation`,

  page: (name: string, options: ResourceOptions = {}, config: CLIConfig) => `Create a ${config.projectType} page component named ${name} with:
    - ${config.localization ? 'Next.js i18n support' : 'Standard routing'}
    - ${options.css ? 'CSS Modules styling' : 'Inline styles'}
    - ${options.components ? 'Sub-components folder structure' : 'Monolithic design'}
    - ${options.test ? 'Test boilerplate included' : 'No tests'}
    - TypeScript interfaces and proper props
    - Responsive design principles`,

  component: (name: string, options: ResourceOptions = {}) => `Generate a React component named ${name} that:
    - Uses functional component with TypeScript
    - Includes proper Props interface
    - ${options.functionality || 'provides reusable UI functionality'}
    - Follows React best practices
    - Includes JSDoc documentation
    - ${options.css ? 'Uses CSS modules for styling' : 'Uses inline styles'}`,

  service: (name: string, options: ResourceOptions = {}) => `Create a service class named ${name}Service that:
    - ${options.functionality || 'handles API communication'}
    - Uses TypeScript interfaces for all data
    - Includes proper error handling
    - Implements async/await patterns
    - Has comprehensive JSDoc documentation
    - Follows service layer best practices`
};

export async function createResource(
  resourceType: keyof typeof prompts,
  name: string,
  config: CLIConfig,
  options: ResourceOptions = {}
): Promise<void> {
  try {
    console.log(chalk.cyan(`🤖 Generating ${resourceType} with Mistral AI...`));
    
    const ext = config.typescript ? (resourceType === 'type' ? 'ts' : 'tsx') : 'js';
    const resourcePath = path.join(
      config.baseDir,
      `${resourceType}s`,
      resourceType === 'hook' ? `use${name}` : name
    );

    // Get the appropriate prompt for the resource type
    const prompt = resourceType === 'page' 
      ? prompts[resourceType](name, options, config)
      : prompts[resourceType](name, options);

    // Generate code using Mistral AI
    const content = await generateCode(prompt, {
      projectType: config.projectType,
      typescript: config.typescript,
      localization: config.localization
    });

    if (content) {
      createFile(`${resourcePath}.${ext}`, content);
      console.log(chalk.green(`✅ Created ${resourceType}: ${resourcePath}.${ext}`));
      
      // Create test file if requested
      if (options.test && content) {
        const testContent = await generateCode(
          `Generate comprehensive tests for the ${resourceType} named ${name}:
          
${content}

Create Jest/React Testing Library tests that:
- Test all major functionality
- Include edge cases
- Use proper TypeScript types
- Follow testing best practices`,
          { 
            projectType: config.projectType, 
            typescript: config.typescript 
          }
        );
        
        if (testContent) {
          createFile(`${resourcePath}.test.${ext}`, testContent);
          console.log(chalk.green(`✅ Created test: ${resourcePath}.test.${ext}`));
        }
      }
    } else {
      console.log(chalk.yellow(`⚠️ Failed to generate ${resourceType} with AI`));
    }
  } catch (error) {
    console.error(chalk.red(`❌ Error creating ${resourceType}:`), error instanceof Error ? error.message : 'Unknown error');
  }
}

// Convenience functions for specific resource types
export async function createHook(name: string, config: CLIConfig, options: ResourceOptions = {}) {
  return createResource('hook', name, config, options);
}

export async function createUtil(name: string, config: CLIConfig, options: ResourceOptions = {}) {
  return createResource('util', name, config, options);
}

export async function createType(name: string, config: CLIConfig, options: ResourceOptions = {}) {
  return createResource('type', name, config, options);
}

export async function createPage(name: string, config: CLIConfig, options: ResourceOptions = {}) {
  return createResource('page', name, config, options);
}

export async function createComponent(name: string, config: CLIConfig, options: ResourceOptions = {}) {
  return createResource('component', name, config, options);
}

export async function createService(name: string, config: CLIConfig, options: ResourceOptions = {}) {
  return createResource('service', name, config, options);
}

// Example usage function
export function showResourceCreationExample() {
  console.log(chalk.blue('\n📖 Mistral AI Resource Creation Examples:'));
  console.log(chalk.gray('// Create a custom hook'));
  console.log(chalk.green('await createHook("DataFetcher", config, { functionality: "fetch and cache API data" });'));
  console.log(chalk.gray('\n// Create a utility function'));
  console.log(chalk.green('await createUtil("formatCurrency", config, { functionality: "format numbers as currency" });'));
  console.log(chalk.gray('\n// Create TypeScript types'));
  console.log(chalk.green('await createType("User", config, { functionality: "user profile and permissions" });'));
  console.log(chalk.gray('\n// Create a page component'));
  console.log(chalk.green('await createPage("Dashboard", config, { css: true, components: true, test: true });'));
}
