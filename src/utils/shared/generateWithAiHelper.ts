import { GeneratorType } from '../../types/generator-type';

/**
 * Creates standardized AI options for any generator
 * This ensures consistent AI integration across all generators
 */
export function createAIOptions(
  name: string,
  generatorType: GeneratorType,
  useTS: boolean,
  features?: string,
  additionalFeatures?: string
): {
  features: string;
  additionalPrompt: string;
} {
  const basePrompt = `Create a React ${generatorType} named ${name} in ${useTS ? 'TypeScript' : 'JavaScript'} with JSDoc comments.`;
  
  const additionalPrompt = additionalFeatures 
    ? `${basePrompt}\nAdditional features: ${additionalFeatures}`
    : basePrompt;

  return {
    features: features || '',
    additionalPrompt
  };
}

/**
 * Creates AI options specifically for HOCs
 */
export function createHOCAIOptions(name: string, useTS: boolean, features?: string): {
  features: string;
  additionalPrompt: string;
} {
  return createAIOptions(name, 'hoc', useTS, features);
}

/**
 * Creates AI options specifically for Hooks
 */
export function createHookAIOptions(name: string, useTS: boolean, features?: string): {
  features: string;
  additionalPrompt: string;
} {
  return createAIOptions(name, 'hook', useTS, features);
}

/**
 * Creates AI options specifically for Guards
 */
export function createGuardAIOptions(name: string, useTS: boolean, features?: string): {
  features: string;
  additionalPrompt: string;
} {
  return createAIOptions(name, 'guard', useTS, features);
}

/**
 * Creates AI options specifically for Contexts
 */
export function createContextAIOptions(name: string, useTS: boolean, features?: string): {
  features: string;
  additionalPrompt: string;
} {
  return createAIOptions(name, 'context', useTS, features);
}

/**
 * Creates AI options specifically for Services
 */
export function createServiceAIOptions(name: string, useTS: boolean, features?: string): {
  features: string;
  additionalPrompt: string;
} {
  return createAIOptions(name, 'service', useTS, features);
}

/**
 * Creates AI options specifically for Types
 */
export function createTypeAIOptions(name: string, useTS: boolean, features?: string): {
  features: string;
  additionalPrompt: string;
} {
  return createAIOptions(name, 'type', useTS, features);
}

/**
 * Creates AI options specifically for Layouts
 */
export function createLayoutAIOptions(name: string, useTS: boolean, features?: string): {
  features: string;
  additionalPrompt: string;
} {
  return createAIOptions(name, 'layout', useTS, features);
}

/**
 * Creates AI options specifically for Redux
 */
export function createReduxAIOptions(name: string, useTS: boolean, features?: string): {
  features: string;
  additionalPrompt: string;
} {
  return createAIOptions(name, 'redux', useTS, features);
}

/**
 * Creates AI options specifically for Test Utils
 */
export function createTestUtilsAIOptions(name: string, useTS: boolean, features?: string): {
  features: string;
  additionalPrompt: string;
} {
  return createAIOptions(name, 'test-utils', useTS, features);
}
