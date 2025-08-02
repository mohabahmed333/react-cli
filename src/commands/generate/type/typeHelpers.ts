import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { askQuestion } from '../../../utils/ai/prompt';
import { CLIConfig, setupConfiguration } from '../../../utils/config/config';
import { createGeneratedFile } from '../../../utils/createGeneratedFile/createGeneratedFile';
import { 
  shouldUseAI, 
  getAIFeatures
} from '../../../utils/ai/generateAIHelper';
import readline from 'readline';
import { GenerateOptions } from '../../../utils/ai/generateAIHelper';
import { Interface } from 'readline';
import { findFoldersByName } from '../../../utils/createGeneratedFile/findFolderByName';
 


export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function isPascalCase(name: string) {
  return /^[A-Z][a-zA-Z0-9]*$/.test(name);
}

export function isValidPageName(name: string) {
  // Allow PascalCase names
  if (isPascalCase(name)) {
    return true;
  }
  
  // Allow dynamic route patterns like _[id], _[productId], etc.
  if (name.startsWith('_[') && name.endsWith(']')) {
    const paramName = name.slice(2, -1);
    // Parameter name should be camelCase or lowercase
    return /^[a-z][a-zA-Z0-9]*$/.test(paramName);
  }
  
  return false;
}

function getTypePromptQuestions(kind: 'enum' | 'interface' | 'class' | 'type'): { [key: string]: string } {
  const questions: { [key: string]: { [key: string]: string } } = {
    enum: {
      values: 'What values should the enum include? (comma-separated): ',
      description: 'Add a description for the enum? (optional): ',
      isNumeric: 'Should this be a numeric enum? (y/n): '
    },
    interface: {
      properties: 'What properties should the interface include? (comma-separated): ',
      extends: 'Should this interface extend another interface? (name or empty): ',
      generics: 'Add generic type parameters? (e.g., T, K or empty): '
    },
    class: {
      properties: 'What properties should the class include? (comma-separated): ',
      methods: 'What methods should the class include? (comma-separated): ',
      extends: 'Should this class extend another class? (name or empty): ',
      implements: 'Should this class implement  interfaces? (comma-separated or empty): '
    },
    type: {
      properties: 'What properties should the type include? (comma-separated): ',
      unions: 'Should this be a union type? List types (comma-separated or empty): ',
      generics: 'Add generic type parameters? (e.g., T, K or empty): '
    }
  };
  return questions[kind] || {};
}

async function getTypeFeatures(rl: readline.Interface, kind: 'enum' | 'interface' | 'class' | 'type', name: string): Promise<string> {
  const questions = getTypePromptQuestions(kind);
  const features: string[] = [];

  console.log(chalk.cyan(`\n📝 ${capitalize(kind)} Configuration for ${name}`));
  console.log(chalk.dim('======================'));

  for (const [key, question] of Object.entries(questions)) {
    const answer = await askQuestion(rl, chalk.blue(question));
    if (answer.trim()) {
      features.push(`${key}: ${answer}`);
    }
  }

  return features.join(', ');
}

export async function handleNamedType(kind: 'enum' | 'interface' | 'class', name: string | undefined, folder: string | undefined, options: GenerateOptions, rl: Interface) {
  try {
    console.log(chalk.cyan(`\n📝 ${capitalize(kind)} Generator`));
    console.log(chalk.dim('======================'));

    const config = await setupConfiguration(rl);
    let typeName = name;
    let targetDir: string | undefined = undefined;
    let useAI = false;
    let aiFeatures = '';

    if (options.interactive) {
      // 1. Prompt for name
      typeName = (await askQuestion(rl, chalk.blue(`Enter ${kind} name (PascalCase): `))) || '';
      if (!isPascalCase(typeName)) {
        console.log(chalk.red(`❌ ${capitalize(kind)} name must be PascalCase and start with a capital letter`));
        return;
      }

      // Ask about AI usage if enabled
      if (config.aiEnabled) {
        useAI = await shouldUseAI(rl, options, config);
        if (useAI) {
          // Get specific features based on type kind
          aiFeatures = await getTypeFeatures(rl, kind, typeName);
        }
      }

      // 2. Ask if user wants to add to a specific folder
      const useFolder = await askQuestion(rl, chalk.blue(`Add to a specific folder under app/? (y/n): `));
      if (useFolder.toLowerCase() === 'y') {
        // 3. Prompt for folder name
        const folderName = await askQuestion(rl, chalk.blue('Enter folder name: '));
        if (!folderName) {
          console.log(chalk.red('❌ Folder name required.'));
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
              console.log(chalk.yellow(`⏩ ${capitalize(kind)} creation cancelled`));
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
              console.log(chalk.red('Invalid selection. Creation cancelled.'));
              return;
            }
            targetDir = chosen;
          }
        }
      } else {
        targetDir = path.join(config.baseDir, 'types');
      }
    } else {
      // Non-interactive mode (legacy)
      if (!typeName) {
        console.log(chalk.red(`❌ ${capitalize(kind)} name is required.`));
        return;
      }
      if (!isPascalCase(typeName)) {
        console.log(chalk.red(`❌ ${capitalize(kind)} name must be PascalCase and start with a capital letter`));
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
            return;
          } else if (matches.length === 1) {
            targetDir = matches[0];
          } else {
            targetDir = matches[0]; // Default to first match
          }
        }
      } else {
        targetDir = path.join(config.baseDir, 'types');
      }
      useAI = await shouldUseAI(rl, options, config);
    }

    await createNamedTypeInPath(kind, typeName, targetDir, { ...options, useAI, aiFeatures, config, rl });
  } catch (error) {
    console.error(chalk.red(`❌ Error generating ${kind}:`), error);
  } finally {
    rl.close();
  }
}

export async function createNamedTypeInPath(kind: 'enum' | 'interface' | 'class', typeName: string, fullPath: string, options: GenerateOptions & { config: CLIConfig }) {
  try {
    let defaultContent = '';
    let generatorType: 'enum' | 'interface' | 'type' = kind === 'class' ? 'type' : kind; // Map 'class' to 'type'
    
    if (kind === 'enum') {
      defaultContent = `export enum ${typeName} {\n  // Add enum members here\n  Example = 'EXAMPLE'\n}\n`;
    } else if (kind === 'interface') {
      defaultContent = `export interface ${typeName} {\n  // Add properties here\n}\n`;
    } else if (kind === 'class') {
      defaultContent = `export class ${typeName} {\n  // Add properties and methods here\n  constructor() {\n    // ...\n  }\n}\n`;
    }

    await createGeneratedFile({
      rl: options.rl!,
      config: options.config,
      type: generatorType,
      name: typeName,
      targetDir: fullPath,
      useTS: true, // Types are always TypeScript
      replace: options.replace ?? false,
      defaultContent,
      aiOptions: options.useAI ? {
        features: options.aiFeatures,
        additionalPrompt: `Create a ${kind} named ${typeName} with proper TypeScript typing.`
      } : undefined
    });

    console.log(chalk.green(`✅ Successfully generated ${capitalize(kind)}: ${typeName}`));
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log(chalk.red(`❌ Error creating ${kind}:`));
    console.error(chalk.red(errorMessage));
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      console.log(chalk.yellow('💡 Check that parent directories exist and are writable'));
    } else if (error instanceof Error && 'code' in error && error.code === 'EACCES') {
      console.log(chalk.yellow('💡 You might need permission to write to this directory'));
    }
  }
}

export async function handleTypeLegacy(name: string | undefined, folder: string | undefined, options: GenerateOptions, rl: Interface) {
  try {
    console.log(chalk.cyan('\n📝 Type Generator'));
    console.log(chalk.dim('======================'));

    const config = await setupConfiguration(rl);
    let typeName = name;
    let targetDir: string | undefined = undefined;
    let useAI = false;
    let aiFeatures = '';

    if (options.interactive) {
      typeName = (await askQuestion(rl, chalk.blue('Enter type name (PascalCase): '))) || '';
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(typeName)) {
        console.log(chalk.red('❌ Type name must be PascalCase and start with a capital letter'));
        return;
      }

      // Ask about AI usage if enabled
      if (config.aiEnabled) {
        useAI = await shouldUseAI(rl, options, config);
        if (useAI) {
          // Get specific features for type
          aiFeatures = await getTypeFeatures(rl, 'type', typeName);
        }
      }

      // 2. Ask if user wants to add to a specific folder
      const useFolder = await askQuestion(rl, chalk.blue('Add to a specific folder under app/? (y/n): '));
      if (useFolder.toLowerCase() === 'y') {
        // 3. Prompt for folder name
        const folderName = await askQuestion(rl, chalk.blue('Enter folder name: '));
        if (!folderName) {
          console.log(chalk.red('❌ Folder name required.'));
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
              console.log(chalk.yellow('⏩ Type creation cancelled'));
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
              console.log(chalk.red('Invalid selection. Type creation cancelled.'));
              return;
            }
            targetDir = chosen;
          }
        }
      } else {
        targetDir = path.join(config.baseDir, 'types');
      }
    } else {
      // Non-interactive mode (legacy)
      if (!typeName) {
        console.log(chalk.red('❌ Type name is required.'));
        return;
      }
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(typeName)) {
        console.log(chalk.red('❌ Type name must be PascalCase and start with a capital letter'));
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
            return;
          } else if (matches.length === 1) {
            targetDir = matches[0];
          } else {
            targetDir = matches[0]; // Default to first match
          }
        }
      } else {
        targetDir = path.join(config.baseDir, 'types');
      }
      useAI = await shouldUseAI(rl, options, config);
    }

    await createTypeLegacyInPath(typeName, targetDir, { ...options, useAI, aiFeatures, config, rl });
  } catch (error) {
    console.error(chalk.red('❌ Error generating type:'), error);
  } finally {
    rl.close();
  }
}

export async function createTypeLegacyInPath(typeName: string, fullPath: string, options: GenerateOptions & { config: CLIConfig }) {
  try {
    const defaultContent = `export interface ${typeName} {\n  // Add properties here\n}\n\nexport type ${typeName}Type = {\n  id: string;\n  name: string;\n};\n`;

    await createGeneratedFile({
      rl: options.rl!,
      config: options.config,
      type: 'type',
      name: typeName,
      targetDir: fullPath,
      useTS: true, // Types are always TypeScript
      replace: options.replace ?? false,
      defaultContent,
      aiOptions: options.useAI ? {
        features: options.aiFeatures,
        additionalPrompt: `Create TypeScript type definitions for ${typeName} with proper typing.`
      } : undefined
    });

    console.log(chalk.green(`✅ Successfully generated type: ${typeName}`));
  } catch (error: unknown) {
    console.log(chalk.red('❌ Error creating type:'));
    console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      console.log(chalk.yellow('💡 Check that parent directories exist and are writable'));
    } else if (error instanceof Error && 'code' in error && error.code === 'EACCES') {
      console.log(chalk.yellow('💡 You might need permission to write to this directory'));
    }
  }
} 