import { GenerateOptions } from '../../../../utils/ai/generateAIHelper';
import { Interface as ReadlineInterface } from 'readline';

export interface PageOptions extends GenerateOptions {
  css?: boolean;
  test?: boolean;
  components?: boolean;
  lib?: boolean;
  hooks?: boolean;
  utils?: boolean;
  types?: boolean;
  layout?: boolean;
  next?: boolean;
  intl?: boolean;
  route?: boolean;
  perfHook?: boolean;
  perfMonitoring?: boolean;
  auditOnBuild?: boolean;
  rl?: ReadlineInterface;
}

export interface FileToGenerate {
  type: string;
  name: string;
  targetDir: string;
  useTS: boolean;
  content: string;
  aiOptions?: {
    features?: string;
    additionalPrompt?: string;
  };
}
