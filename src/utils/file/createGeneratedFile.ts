import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { buildPrompt, generateWithAI } from '../shared/generateWithAi';
import { ensureDirectoryExists } from '../shared/ensureFIleExist';
import { getFileExtension } from './getFileExtention';
import { FileExtension, GenerateFileParams, GenerateFileResult, GeneratorType } from '../../types/generator-type';
import { askQuestion } from '../prompt';
import { formatFileName } from './formatFIleName';
 

export async function createGeneratedFile(params: GenerateFileParams):
  Promise<GenerateFileResult> {
  try {
    await ensureDirectoryExists(params.targetDir);
    const ext = getFileExtension(params.type, params.useTS) as FileExtension;
    const fileName = formatFileName(params.name, params.type, ext);
    const filePath = path.join(params.targetDir, fileName);

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

  const useAI = await askQuestion(
    params.rl,
    chalk.blue(`Generate ${params.type} with AI? (y/n): `)
  );

  if (useAI.toLowerCase() !== 'y') {
    return { usedAI: false, code: null };
  }

  let features = params.aiOptions?.features;
  if (!params.aiOptions?.skipFeaturePrompt && !features) {
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