import { GenerateOptions } from '../../../../utils/ai/generateAIHelper';

export interface ComponentOptions extends GenerateOptions {
  css?: boolean;
  test?: boolean;
  replace?: boolean;
  aiFeatures?: string;
  lazy?: boolean;
  memo?: boolean;
  forwardRef?: boolean;
  styled?: boolean;
  exportType?: 'default' | 'named';
  jsx?: boolean;
}

export interface FileToGenerate {
  type: string;
  name: string;
  content: string;
  useTS: boolean;
  aiOptions?: {
    features?: string;
    additionalPrompt?: string;
  };
}
