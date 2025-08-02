import chalk from "chalk";
import { generateWithConfiguredAI } from "../ai/aiConfig";
import { askQuestion } from "../prompt";
import { TReadlineInterface } from "../../types/ReadLineInterface";
import { CLIConfig } from "../config";
import { AIGenerationParams, GeneratorType } from "../../types/generator-type";
 
 
 
export async function generateWithAI(
  options: AIGenerationParams
): Promise<{ code: string | null; usedAI: boolean }> {
  const result = {
    code: null,
    usedAI: false
  } as {
    code: string | null;
    usedAI: boolean;
  };

  // Early exit if AI disabled
  if (!options.config.aiEnabled) {
    console.log(chalk.yellow('AI generation is disabled'));
    return result;
  }

  // Confirm AI usage first
  // const useAI = await askQuestion(
  //   options.readline,
  //   chalk.blue('Generate with AI? (y/n): ')
  // );

  // if (useAI.toLowerCase() !== 'y') {
  //   return result; // Return empty result if user declines AI
  // }

  result.usedAI = true;

  // Only collect features if user wants AI and we need them
  let features = options.features;
  if (!options.skipFeaturePrompt && !features) {
    features = await askQuestion(
      options.readline,
      chalk.blue(`Describe ${options.type} features (e.g., "dark mode, SSR"): `)
    );
  }

  try {
    const prompt = buildPrompt({
      type: options.type,
      name: options.name,
      useTS: options.useTS,
      features,
      additionalPrompt: options.additionalPrompt
    });

    const rawCode = await generateWithConfiguredAI(prompt, options.config);
    if (!rawCode) {
      console.log(chalk.yellow('AI returned no code'));
      return result;
    }

    const sanitizedCode = sanitizeCode(rawCode);

    // Final confirmation
    console.log(chalk.cyan('\nGenerated code preview:'));
    console.log(chalk.dim(sanitizedCode.split('\n').slice(0, 10).join('\n')));
    
    const confirm = await askQuestion(
      options.readline,
      chalk.blue('Use this generated code? (y/n): ')
    );

    result.code = confirm.toLowerCase() === 'y' ? sanitizedCode : null;
    return result;

  } catch (error) {
    console.error(chalk.red('AI generation failed:'), error);
    return result;
  }
}

// Helper functions remain similar but now return more detailed results
export function buildPrompt(options: Omit<AIGenerationParams, 'config' | 'readline'>): string {
  const parts = [
    `Create React ${options.type} ${options.name}`,
    `Language: ${options.useTS ? 'TypeScript' : 'JavaScript'}`,
    'Include JSDoc and follow best practices',
    options.features && `Features: ${options.features}`,
    options.additionalPrompt,
    'Output ONLY raw code without markdown'
  ];
  return parts.filter(Boolean).join('\n');
}

function sanitizeCode(code: string): string {
  return code.replace(/^```[a-z]*\n|\n```$/g, '').trim();
}