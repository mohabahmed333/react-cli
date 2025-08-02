import chalk from 'chalk';
import { generateWithConfiguredAI } from '../utils/config/ai/aiConfig';
import { askQuestion } from '../utils/ai/prompt';
import { TReadlineInterface } from '../types/ReadLineInterface';
import { CLIConfig } from '../utils/config/config';
import { PageOptions } from '../commands/generate/page/generatePage';

export interface PageAIGenerationResult {
  page: string;
  hooks?: string;
  utils?: string;
  types?: string;
  css?: string;
  test?: string;
  lib?: string;
}

export interface PageAIRequest {
  name: string;
  options: PageOptions;
  useTS: boolean;
  features: string;
  config: CLIConfig;
  rl: TReadlineInterface;
}

export async function generatePageWithAI(request: PageAIRequest): Promise<PageAIGenerationResult | null> {
  try {
    console.log(chalk.cyan('\n🤖 Generating coordinated page files with AI...'));
    
    // Build comprehensive prompt for all files
    const prompt = buildComprehensivePagePrompt(request);
    
    console.log(chalk.dim('Sending request to AI...'));
    const rawResponse = await generateWithConfiguredAI(prompt, request.config);
    
    if (!rawResponse) {
      console.log(chalk.yellow('AI returned no response'));
      return null;
    }

    // Parse the AI response into separate files
    const parsedFiles = parseAIResponse(rawResponse, request);
    
    // Show preview to user
    console.log(chalk.cyan('\n📋 Generated files preview:'));
    Object.entries(parsedFiles).forEach(([fileType, content]) => {
      if (content) {
        console.log(chalk.blue(`\n--- ${fileType.toUpperCase()} ---`));
        console.log(chalk.dim(content.split('\n').slice(0, 5).join('\n') + '...'));
      }
    });
    
    const confirm = await askQuestion(
      request.rl,
      chalk.blue('\nUse these generated files? (y/n): ')
    );

    if (confirm.toLowerCase() !== 'y') {
      return null;
    }

    return parsedFiles;
  } catch (error) {
    console.error(chalk.red('Page AI generation failed:'), error);
    return null;
  }
}

function buildComprehensivePagePrompt(request: PageAIRequest): string {
  const { name, options, useTS, features } = request;
  const componentName = name.charAt(0).toUpperCase() + name.slice(1);
  
  const requiredFiles = [
    'MAIN_PAGE',
    options.hooks && 'CUSTOM_HOOK',
    options.utils && 'UTILITIES',
    options.types && useTS && 'TYPES',
    options.css && 'CSS_STYLES',
    options.test && 'TEST_FILE',
    options.lib && 'CONSTANTS'
  ].filter(Boolean);

  return `Create a complete React ${useTS ? 'TypeScript' : 'JavaScript'} page component system for "${name}" with the following features: ${features}

REQUIREMENTS:
- Language: ${useTS ? 'TypeScript' : 'JavaScript'}
- Component name: ${componentName}
- Modern React patterns (functional components, hooks)
- Proper error handling and loading states
- Accessibility features (ARIA labels, semantic HTML)
- Mobile-responsive design
- Clean, maintainable code with JSDoc comments

FILES TO GENERATE: ${requiredFiles.join(', ')}

OUTPUT FORMAT:
Please provide the code for each file separated by markers. Use this exact format:

=== MAIN_PAGE ===
[Main page component code here]

${options.hooks ? `=== CUSTOM_HOOK ===
[Custom hook code with state management, API calls, etc.]
` : ''}${options.utils ? `=== UTILITIES ===
[Utility functions for data processing, validation, etc.]
` : ''}${options.types && useTS ? `=== TYPES ===
[TypeScript interfaces and types]
` : ''}${options.css ? `=== CSS_STYLES ===
[CSS modules with responsive design and dark mode support]
` : ''}${options.test ? `=== TEST_FILE ===
[Comprehensive test file with multiple test cases]
` : ''}${options.lib ? `=== CONSTANTS ===
[Constants and configuration values]
` : ''}

INTEGRATION REQUIREMENTS:
- Main page should import and use all generated files appropriately
- Hook should manage state, API calls, and business logic
- Utils should provide reusable helper functions
- Types should define all interfaces and types used across files
- CSS should be modular and follow BEM convention
- Tests should cover main functionality and edge cases
- Constants should be used throughout the codebase

SPECIFIC FEATURES TO IMPLEMENT:
- Loading and error states with proper UI feedback
- Data fetching and state management
- Form validation (if applicable)
- Search/filter functionality (if applicable)
- Responsive design for mobile and desktop
- Dark mode support in CSS
- Accessibility features (proper ARIA labels, keyboard navigation)
- Performance optimizations (memo, useCallback, useMemo where appropriate)

Generate production-ready code that follows React and ${useTS ? 'TypeScript' : 'JavaScript'} best practices.`;
}

function parseAIResponse(response: string, request: PageAIRequest): PageAIGenerationResult {
  const { options } = request;
  const sections = response.split(/=== (\w+) ===/);
  const result: PageAIGenerationResult = { page: '' };

  for (let i = 1; i < sections.length; i += 2) {
    const sectionName = sections[i];
    const content = sections[i + 1]?.trim();

    if (!content) continue;

    // Clean the content by removing markdown code blocks
    const cleanContent = content.replace(/^```[a-z]*\n?|```$/gm, '').trim();

    switch (sectionName) {
      case 'MAIN_PAGE':
        result.page = cleanContent;
        break;
      case 'CUSTOM_HOOK':
        if (options.hooks) result.hooks = cleanContent;
        break;
      case 'UTILITIES':
        if (options.utils) result.utils = cleanContent;
        break;
      case 'TYPES':
        if (options.types) result.types = cleanContent;
        break;
      case 'CSS_STYLES':
        if (options.css) result.css = cleanContent;
        break;
      case 'TEST_FILE':
        if (options.test) result.test = cleanContent;
        break;
      case 'CONSTANTS':
        if (options.lib) result.lib = cleanContent;
        break;
    }
  }

  // Fallback: if no sections found, treat entire response as main page
  if (!result.page && response.trim()) {
    result.page = response.replace(/^```[a-z]*\n?|```$/gm, '').trim();
  }

  return result;
}
