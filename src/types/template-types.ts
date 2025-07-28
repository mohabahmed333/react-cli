export interface TemplateMetadata {
  templateName: string;
  originalName: string;
  description?: string;
  author?: string;
  createdAt: string;
  version: string;
  tags?: string[];
  files?: string[];
  dependencies?: string[];
}

export interface NamingConvention {
  pascal: (str: string) => string;
  camel: (str: string) => string;
  kebab: (str: string) => string;
  snake: (str: string) => string;
  constant: (str: string) => string;
  original: (str: string) => string;
}

export type NamingConventionType = keyof NamingConvention;

export interface TemplateGenerationOptions {
  templateName: string;
  newName: string;
  targetPath: string;
  namingConvention: NamingConventionType;
  replace?: boolean;
  preserveCase?: boolean;
}

export interface TemplateInfo {
  name: string;
  path: string;
  metadata: TemplateMetadata;
  exists: boolean;
}

export interface TemplateSaveOptions {
  sourcePath: string;
  templateName: string;
  originalName?: string;
  description?: string;
  author?: string;
  tags?: string[];
} 