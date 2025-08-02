import chalk from 'chalk';
import path from 'path';
import { CLIConfig } from '../../../../utils/config/config';
import { createGeneratedFile } from '../../../../utils/createGeneratedFile/createGeneratedFile';
import { GeneratorType } from '../../../../types/generator-type';
import { ComponentOptions, FileToGenerate } from './componentTypes';
import { 
  generateComponentContent, 
  generateCSSContent, 
  generateStyledComponentsContent, 
  generateTestContent 
} from '../generators/componentContentGenerators';
import { generateComponentAIPrompt } from '../generators/componentAIPrompts';

/**
 * Get all files to generate for a component
 */
export async function getFilesToGenerate(
  name: string, 
  options: ComponentOptions, 
  useTS: boolean, 
  config: CLIConfig
): Promise<FileToGenerate[]> {
  const files: FileToGenerate[] = [];

  // Main component file - let createGeneratedFile handle AI generation
  files.push({
    type: 'component',
    name,
    content: generateComponentContent(name, options, useTS),
    useTS,
    aiOptions: {
      features: options.aiFeatures || '', // Pass features if provided, empty string if not
      additionalPrompt: generateComponentAIPrompt(name, options, useTS)
    }
  });

  // CSS module
  if (options.css) {
    files.push({
      type: 'css',
      name: `${name}.module`,
      content: generateCSSContent(name),
      useTS: false
      // No aiOptions for CSS files
    });
  }

  // Styled components
  if (options.styled) {
    files.push({
      type: 'styled',
      name: `${name}.styles`,
      content: generateStyledComponentsContent(name),
      useTS: false
      // No aiOptions for styled files
    });
  }

  // Test file
  if (options.test) {
    files.push({
      type: 'test',
      name: `${name}.test`,
      content: generateTestContent(name, useTS, options.exportType),
      useTS
      // No aiOptions for test files
    });
  }

  return files;
}

/**
 * Create component files
 */
export async function createComponent(
  name: string,
  targetDir: string,
  options: ComponentOptions,
  config: CLIConfig,
  rl: any
): Promise<void> {
  const useTS = config.typescript && !options.jsx;
  const componentFolder = path.join(targetDir, name);
  const filesToGenerate = await getFilesToGenerate(name, options, useTS, config);

  // Generate all files in a loop
  for (const file of filesToGenerate) {
    await createGeneratedFile({
      rl: rl,
      config,
      type: file.type as GeneratorType,
      name: file.name,
      targetDir: componentFolder,
      useTS: file.useTS,
      replace: options.replace ?? false,
      defaultContent: file.content,
      aiOptions: file.aiOptions
    });
  }

  console.log(chalk.green(`✅ Successfully generated ${name} component`));
}
