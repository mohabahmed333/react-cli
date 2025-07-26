import { Interface as ReadlineInterface } from 'readline';
import chalk from 'chalk';
import { askQuestion, askBoolean, askMultiSelect, askChoice, ChoiceOption } from '../prompt';
import { CLIConfig } from '../config';

export interface GeneratorOptionsConfig {
  supportedFiles?: {
    css?: boolean;
    test?: boolean;
    components?: boolean;
    lib?: boolean;
    hooks?: boolean;
    utils?: boolean;
    types?: boolean;
    layout?: boolean;
    styles?: boolean;
    story?: boolean;
    props?: boolean;
    index?: boolean;
  };
  aiSupported?: boolean;
  stylingOptions?: ChoiceOption[];
  conditionalOptions?: {
    [key: string]: (config: CLIConfig, useTS: boolean) => boolean;
  };
}

export interface InteractiveResult {
  useAI?: boolean;
  aiFeatures?: string;
  styling?: string;
  additionalFiles: { [key: string]: boolean };
}

/**
 * Handle interactive options for any generator
 */
export async function handleGeneratorOptions(
  rl: ReadlineInterface,
  config: CLIConfig,
  useTS: boolean,
  optionsConfig: GeneratorOptionsConfig
): Promise<InteractiveResult> {
  const result: InteractiveResult = {
    additionalFiles: {}
  };

  // AI Generation Option
  if (optionsConfig.aiSupported !== false) {
    result.useAI = await askBoolean(rl, 'Use AI to generate code?');

    if (result.useAI) {
      result.aiFeatures = await askQuestion(
        rl,
        chalk.blue('Describe features for AI generation (e.g., "data fetching, forms"): ')
      );
    }
  }

  // Styling Options
  if (optionsConfig.stylingOptions && optionsConfig.stylingOptions.length > 0) {
    result.styling = await askChoice(rl, 'Choose styling option:', optionsConfig.stylingOptions);
  } else if (optionsConfig.supportedFiles?.css) {
    const hasCss = await askBoolean(rl, 'Include CSS Module styling?');
    result.additionalFiles.css = hasCss;
  }

  // Additional Files Options
  const additionalFileOptions: ChoiceOption[] = [];

  if (optionsConfig.supportedFiles?.test) {
    additionalFileOptions.push({ value: 'test', label: 'Test file' });
  }

  if (optionsConfig.supportedFiles?.components) {
    additionalFileOptions.push({ value: 'components', label: 'Components folder' });
  }

  if (optionsConfig.supportedFiles?.lib) {
    additionalFileOptions.push({ value: 'lib', label: 'Lib utilities' });
  }

  if (optionsConfig.supportedFiles?.hooks) {
    additionalFileOptions.push({ value: 'hooks', label: 'Custom hooks' });
  }

  if (optionsConfig.supportedFiles?.utils) {
    additionalFileOptions.push({ value: 'utils', label: 'Utility functions' });
  }

  if (optionsConfig.supportedFiles?.types) {
    additionalFileOptions.push({ 
      value: 'types', 
      label: 'TypeScript types', 
      condition: useTS 
    });
  }

  if (optionsConfig.supportedFiles?.layout) {
    additionalFileOptions.push({ 
      value: 'layout', 
      label: 'Layout file', 
      condition: config.projectType === 'next' 
    });
  }

  if (optionsConfig.supportedFiles?.story) {
    additionalFileOptions.push({ value: 'story', label: 'Storybook story' });
  }

  if (optionsConfig.supportedFiles?.styles) {
    additionalFileOptions.push({ value: 'styles', label: 'Styled components' });
  }

  if (optionsConfig.supportedFiles?.props) {
    additionalFileOptions.push({ value: 'props', label: 'Props interface' });
  }

  if (optionsConfig.supportedFiles?.index) {
    additionalFileOptions.push({ value: 'index', label: 'Index file' });
  }

  // Apply conditional options
  if (optionsConfig.conditionalOptions) {
    Object.entries(optionsConfig.conditionalOptions).forEach(([key, condition]) => {
      if (condition(config, useTS)) {
        const existingOption = additionalFileOptions.find(opt => opt.value === key);
        if (!existingOption) {
          additionalFileOptions.push({ 
            value: key, 
            label: key.charAt(0).toUpperCase() + key.slice(1) + ' file' 
          });
        }
      }
    });
  }

  if (additionalFileOptions.length > 0) {
    const selectedFiles = await askMultiSelect(rl, 'Include additional files?', additionalFileOptions);
    result.additionalFiles = { ...result.additionalFiles, ...selectedFiles };
  }

  return result;
}

/**
 * Common styling options for components
 */
export const COMPONENT_STYLING_OPTIONS: ChoiceOption[] = [
  { value: 'none', label: 'No styling' },
  { value: 'css', label: 'CSS Module' },
  { value: 'styled', label: 'Styled Components' },
  { value: 'emotion', label: 'Emotion' }
];

/**
 * Common page generator options
 */
export const PAGE_OPTIONS_CONFIG: GeneratorOptionsConfig = {
  supportedFiles: {
    css: true,
    test: true,
    components: true,
    lib: true,
    hooks: true,
    utils: true,
    types: true,
    layout: true
  },
  aiSupported: true
};

/**
 * Common component generator options
 */
export const COMPONENT_OPTIONS_CONFIG: GeneratorOptionsConfig = {
  supportedFiles: {
    test: true,
    story: true,
    styles: true,
    props: true,
    index: true
  },
  aiSupported: true,
  stylingOptions: COMPONENT_STYLING_OPTIONS
};

/**
 * Common service generator options
 */
export const SERVICE_OPTIONS_CONFIG: GeneratorOptionsConfig = {
  supportedFiles: {
    test: true,
    types: true,
    utils: true
  },
  aiSupported: true
};

/**
 * Common hook generator options
 */
export const HOOK_OPTIONS_CONFIG: GeneratorOptionsConfig = {
  supportedFiles: {
    test: true,
    types: true
  },
  aiSupported: true
};
