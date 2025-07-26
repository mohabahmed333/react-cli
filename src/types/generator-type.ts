import { CLIConfig } from '../utils/config';
import { Interface as ReadlineInterface } from 'readline';

/**
 * All available generator types
 */
export type GeneratorType =
  | 'hook'
  | 'layout'
  | 'component'
  | 'guard'
  | 'hoc'
  | 'redux'
  | 'service'
  | 'test-utils'
  | 'context'
  | 'enum'
  | 'interface'
  | 'type'
  | 'css'
  | 'styled'
  | 'test'
  |'page'
  | 'workers'

/**
 * Supported file extensions</edit>
 */
export type FileExtension = 'ts' | 'tsx' | 'js' | 'jsx';

/**
 * Common CLI options for all generators
 */
export interface GeneratorOptions {
  replace?: boolean;
  interactive?: boolean;
  ai?: boolean;
  skipFeaturePrompt?: boolean;
  [key: string]: any; // Allow additional generator-specific options
}

/**
 * AI-specific configuration options
 */
export interface AIOptions {
  features?: string;
  additionalPrompt?: string;
  skipFeaturePrompt?: boolean;
}

/**
 * Parameters for file generation
 */
export interface GenerateFileParams {
  rl: ReadlineInterface;
  config: CLIConfig;
  type: GeneratorType;
  name: string;
  targetDir: string;
  useTS: boolean;
  replace: boolean;
  defaultContent: string;
  aiOptions?: AIOptions;
}

/**
 * Result of file generation
 */
export interface GenerateFileResult {
  code: string | null;
  usedAI: boolean;
}

/**
 * Parameters for AI generation
 */
export interface AIGenerationParams {
  config: CLIConfig;
  type: GeneratorType;
  name: string;
  useTS: boolean;
  readline: ReadlineInterface;
  features?: string;
  additionalPrompt?: string;
  skipFeaturePrompt?: boolean;
}
