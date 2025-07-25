import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { generateWithGemini } from '../services/gemini-service';
import { createFolder, createFile } from '../utils/docUtils';
import type { CLIConfig } from '../utils/config';

function hasExistingDocs(filePath: string, docsConfig: any): boolean {
  const ext = path.extname(filePath);
  const baseName = path.basename(filePath, ext);
  const dirName = path.dirname(filePath);

  // Check for markdown docs
  const mdPath = path.join(docsConfig.outputDir, 'markdown', dirName, `${baseName}.md`);
  const hasMarkdown = fs.existsSync(mdPath);

  // Check for Storybook stories
  const storyPath = path.join(docsConfig.outputDir, 'storybook', dirName, `${baseName}.stories.${ext}`);
  const hasStory = fs.existsSync(storyPath);

  return hasMarkdown || hasStory;
}

async function generateAIStorybook(filePath: string, config: CLIConfig, docsConfig: any) {
  const content = fs.readFileSync(filePath, 'utf8');
  const ext = path.extname(filePath);
  const name = path.basename(filePath, ext);
  
  const storyDir = path.join(docsConfig.outputDir, 'storybook', path.dirname(filePath));
  createFolder(storyDir);
  
  const storyPath = path.join(storyDir, `${name}.stories.${config.typescript ? 'tsx' : 'jsx'}`);

  // Skip if story already exists and force flag is not set
  if (fs.existsSync(storyPath) && !docsConfig.force) {
    console.log(chalk.yellow(`  ↳ Skipping existing story: ${storyPath} (use --force to override)`));
    return;
  }
  
  const prompt = `Generate a comprehensive Storybook story file for this React ${config.typescript ? 'TypeScript' : 'JavaScript'} component:
    \n### Component Code:\n${content}
    \n### Requirements:
    - Include default export with title and component
    - Create Template const for reusability
    - Add multiple story variants (Default, Empty, WithData, etc.)
    - Include proper args with realistic values
    - Add controls and documentation where appropriate
    - Use proper TypeScript types if the component uses TypeScript
    \nOutput ONLY the Storybook story code, no explanations:`;
  
  const storyContent = await generateWithGemini(prompt, config);
  if (storyContent) {
    createFile(storyPath, storyContent);
    console.log(chalk.green(`  ↳ Created AI-generated Storybook story: ${storyPath}`));
  }
}

async function generateAIMarkdown(filePath: string, config: CLIConfig, docsConfig: any) {
  const content = fs.readFileSync(filePath, 'utf8');
  const ext = path.extname(filePath);
  const name = path.basename(filePath, ext);
  const type = filePath.includes('components') ? 'component' : 
               filePath.includes('hooks') ? 'hook' : 'utility';
  
  const mdDir = path.join(docsConfig.outputDir, 'markdown', path.dirname(filePath));
  createFolder(mdDir);
  
  const mdPath = path.join(mdDir, `${name}.md`);

  // Skip if markdown already exists and force flag is not set
  if (fs.existsSync(mdPath) && !docsConfig.force) {
    console.log(chalk.yellow(`  ↳ Skipping existing docs: ${mdPath} (use --force to override)`));
    return;
  }
  
  const prompt = `Generate comprehensive markdown documentation for this React ${type}:
    \n### Code:\n${content}
    \n### Requirements:
    - Start with a clear title and description
    - For components: document all props with types and descriptions
    - For hooks: include usage examples and return value documentation
    - Add code examples showing common use cases
    - Include any important notes or caveats
    - Document TypeScript types if present
    - Add installation/import instructions
    \nOutput ONLY the markdown documentation, no explanations:`;
  
  const mdContent = await generateWithGemini(prompt, config);
  if (mdContent) {
    createFile(mdPath, mdContent);
    console.log(chalk.green(`  ↳ Created AI-generated Markdown docs: ${mdPath}`));
  }
}

export async function generateAIDocumentation(options: any, config: CLIConfig) {
  if (!config.aiEnabled) {
    console.log(chalk.yellow('AI features are not enabled. Run "yarn re enable-ai" to enable them.'));
    return;
  }

  const docsConfig = {
    outputDir: options.output || path.join(config.baseDir, 'docs'),
    formats: options.all ? ['storybook', 'markdown'] : 
            [options.storybook && 'storybook', options.md && 'markdown'].filter(Boolean),
    force: options.force || false,
    specificFile: options.file
  };

  if (docsConfig.formats.length === 0) {
    console.log(chalk.yellow('ℹ️ No documentation formats specified. Use --storybook, --md or --all'));
    return;
  }

  createFolder(docsConfig.outputDir);
  console.log(chalk.cyan('\n🧠 Generating AI-powered documentation...'));

  // Handle specific file if provided
  if (docsConfig.specificFile) {
    if (!fs.existsSync(docsConfig.specificFile)) {
      console.log(chalk.red(`File not found: ${docsConfig.specificFile}`));
      return;
    }

    const ext = path.extname(docsConfig.specificFile);
    if (!['.tsx', '.jsx', '.ts', '.js'].includes(ext)) {
      console.log(chalk.red('Only TypeScript and JavaScript files are supported'));
      return;
    }

    // Check if file already has docs
    if (!docsConfig.force && hasExistingDocs(docsConfig.specificFile, docsConfig)) {
      console.log(chalk.yellow('Documentation already exists. Use --force to regenerate.'));
      return;
    }

    if (docsConfig.formats.includes('storybook') && (ext === '.tsx' || ext === '.jsx')) {
      await generateAIStorybook(docsConfig.specificFile, config, docsConfig);
    }
    if (docsConfig.formats.includes('markdown')) {
      await generateAIMarkdown(docsConfig.specificFile, config, docsConfig);
    }
    return;
  }

  // Process all files if no specific file is provided
  // Process components directory
  const componentsPath = path.join(config.baseDir, 'components');
  if (fs.existsSync(componentsPath)) {
    const files = fs.readdirSync(componentsPath);
    for (const file of files) {
      if (!file.endsWith('.tsx') && !file.endsWith('.jsx')) continue;
      
      const filePath = path.join(componentsPath, file);
      
      // Skip if docs exist and force is not set
      if (!docsConfig.force && hasExistingDocs(filePath, docsConfig)) {
        console.log(chalk.yellow(`Skipping ${file} - documentation exists`));
        continue;
      }

      if (docsConfig.formats.includes('storybook')) {
        await generateAIStorybook(filePath, config, docsConfig);
      }
      if (docsConfig.formats.includes('markdown')) {
        await generateAIMarkdown(filePath, config, docsConfig);
      }
    }
  }

  // Process hooks directory
  const hooksPath = path.join(config.baseDir, 'hooks');
  if (fs.existsSync(hooksPath)) {
    const files = fs.readdirSync(hooksPath);
    for (const file of files) {
      if (!file.endsWith('.ts') && !file.endsWith('.js')) continue;
      
      const filePath = path.join(hooksPath, file);

      // Skip if docs exist and force is not set
      if (!docsConfig.force && hasExistingDocs(filePath, docsConfig)) {
        console.log(chalk.yellow(`Skipping ${file} - documentation exists`));
        continue;
      }

      if (docsConfig.formats.includes('markdown')) {
        await generateAIMarkdown(filePath, config, docsConfig);
      }
    }
  }

  console.log(chalk.green('\n✅ AI documentation generation complete!'));
} 