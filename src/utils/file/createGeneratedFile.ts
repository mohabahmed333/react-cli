import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { buildPrompt, generateWithAI } from '../shared/generateWithAi';
import { ensureDirectoryExists } from '../shared/ensureFIleExist';
import { getFileExtension } from './getFileExtention';
import { FileExtension, GenerateFileParams, GenerateFileResult, GeneratorType } from '../../types/generator-type';
import { askQuestion } from '../prompt';
import { formatFileName } from './formatFIleName';
import { findFoldersByName } from './findFolderByName';

export async function createGeneratedFile(params: GenerateFileParams):
  Promise<GenerateFileResult> {
  try {
    // Determine target directory using existing logic
    let targetDir = params.targetDir;
    
    // Only ask for custom path in interactive mode
    if (params.rl) {
      // First, check if there are existing folders with the same name
      const baseDir = params.config?.baseDir || 'app';
      const existingFolders = findFoldersByName(baseDir, params.name);
      
      if (existingFolders.length > 0) {
        console.log(chalk.cyan(`Found existing folder(s) for "${params.name}":`));
        existingFolders.forEach((folder, index) => {
          const relativePath = path.relative(baseDir, folder);
          console.log(chalk.dim(`  ${index + 1}. ${relativePath}`));
        });
        
        const useExisting = await askQuestion(
          params.rl,
          chalk.blue(`Use existing folder? (y/n): `)
        );
        
        if (useExisting.toLowerCase() === 'y') {
          if (existingFolders.length === 1) {
            targetDir = existingFolders[0];
          } else {
            const selection = await askQuestion(
              params.rl,
              chalk.blue(`Select folder (1-${existingFolders.length}): `)
            );
            const index = parseInt(selection) - 1;
            if (index >= 0 && index < existingFolders.length) {
              targetDir = existingFolders[index];
            }
          }
        }
      }
      
      // Ask if user wants to customize the path
      const currentPath = path.relative(baseDir, targetDir);
      const customPath = await askQuestion(
        params.rl,
        chalk.blue(`Target directory (current: ${currentPath}, press Enter to use default): `)
      );
      
      if (customPath.trim()) {
        targetDir = path.isAbsolute(customPath) 
          ? customPath 
          : path.join(baseDir, customPath);
      }
    }

    await ensureDirectoryExists(targetDir);
    const ext = getFileExtension(params.type, params.useTS) as FileExtension;
    const fileName = formatFileName(params.name, params.type, ext);
    const filePath = path.join(targetDir, fileName);

    if (fs.existsSync(filePath) && !params.replace) {
      console.log(chalk.yellow(`⚠️ ${params.type} file already exists: ${filePath}`));
      return { usedAI: false, code: null };
    }

    let content = params.defaultContent;
    let usedAI = false;

    if (params.config.aiEnabled && params.aiOptions) {
      const { code, usedAI: aiUsed } = await handleAIGeneration(params);
      if (aiUsed && code) {
        content = code;
        usedAI = true;
      }
    }

    fs.writeFileSync(filePath, content);
    console.log(chalk.green(`✅ Created ${params.type}: ${filePath}`));
    return { usedAI, code: content };
  } catch (error) {
    handleFileError(error as Error, params.type);
    return { usedAI: false, code: null };
  }
}

async function handleAIGeneration(params: GenerateFileParams):
  Promise<GenerateFileResult> {
  if (!params.rl) return { usedAI: false, code: null };

  // Check if AI was already explicitly requested (via --ai flag or interactive mode)
  const explicitlyRequested = params.aiOptions?.features !== undefined &&
    params.aiOptions?.features !== '' &&
    params.aiOptions?.features !== 'AI_REQUESTED';

  const aiRequested = params.aiOptions?.features === 'AI_REQUESTED';

  let useAI = false;

  if (explicitlyRequested) {
    // AI was already chosen with specific features, don't ask again
    useAI = true;
  } else if (aiRequested) {
    // AI was requested via --ai flag, but no features provided yet
    useAI = true;
  } else {
    // Ask user if they want to use AI (only if not already decided)
    const response = await askQuestion(
      params.rl,
      chalk.blue(`Generate ${params.type} with AI? (y/n): `)
    );
    useAI = response.toLowerCase() === 'y';
  }

  if (!useAI) {
    return { usedAI: false, code: null };
  }

  let features = params.aiOptions?.features || '';

  // Only prompt for features if they weren't already provided or if AI was just requested
  if (!features || features === 'AI_REQUESTED') {
    features = await askQuestion(
      params.rl,
      chalk.blue(`Describe ${params.type} features (e.g., "dark mode, SSR"): `)
    );
  }

  const aiCode = await generateWithAI({
    config: params.config,
    type: params.type,
    name: params.name,
    useTS: params.useTS,
    readline: params.rl,
    features,
    additionalPrompt: params.aiOptions?.additionalPrompt
  });

  return aiCode as GenerateFileResult;
}

function handleFileError(error: Error, type: GeneratorType): void {
  const errorMessage = error.message || 'Unknown error';
  console.log(chalk.red(`❌ Error creating ${type}:`));
  console.error(chalk.red(errorMessage));

  if ('code' in error) {
    if (error.code === 'ENOENT') {
      console.log(chalk.yellow('💡 Check that parent directories exist and are writable'));
    } else if (error.code === 'EACCES') {
      console.log(chalk.yellow('💡 You might need permission to write to this directory'));
    }
  }
}