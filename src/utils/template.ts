import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { createFolder } from './file';
import {
  TemplateMetadata,
  NamingConvention,
  TemplateGenerationOptions,
  TemplateInfo,
  TemplateSaveOptions,
  NamingConventionType,
  
} from '../types/template-types';

// Template directory configuration
export const TEMPLATE_DIR = path.join(process.cwd(), '.templates');
export const TEMPLATE_METADATA_FILE = '.template.json';

// Naming convention transformations
export const namingConventions: NamingConvention = {
  pascal: (str: string) => {
    return str.split(/[\s\-_]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  },
  camel: (str: string) => {
    const pascal = namingConventions.pascal(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  },
  kebab: (str: string) => {
    return str.replace(/\s+/g, '-')
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase();
  },
  snake: (str: string) => {
    return str.replace(/\s+/g, '_')
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .toLowerCase();
  },
  constant: (str: string) => {
    return str.replace(/\s+/g, '_')
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .toUpperCase();
  },
  original: (str: string) => str
};

// Protected terms that should never be transformed
const PROTECTED_TERMS = [
  'inventory', 'component', 'filter', 'column', 'type', 
  'status', 'data', 'file', 'locale', 'context', 
  'provider', 'hook', 'util', 'interface', 'import',
  'export', 'class', 'function', 'const', 'let', 'var',
  'enum', 'namespace', 'module', 'public', 'private',
  'protected', 'readonly', 'static', 'extends', 'implements',
  'abstract', 'async', 'await', 'react', 'string', 'number',
  'boolean', 'object', 'array'
];

/**
 * Ensure the template directory exists
 */
export function ensureTemplateDirectory(): void {
  createFolder(TEMPLATE_DIR);
}

/**
 * Get the path to a template
 */
export function getTemplatePath(templateName: string): string {
  return path.join(TEMPLATE_DIR, templateName);
}

/**
 * Get the path to template metadata file
 */
export function getTemplateMetadataPath(templateName: string): string {
  return path.join(getTemplatePath(templateName), TEMPLATE_METADATA_FILE);
}

/**
 * Check if a template exists
 */
export function templateExists(templateName: string): boolean {
  return fs.existsSync(getTemplatePath(templateName));
}

/**
 * Get template metadata
 */
export function getTemplateMetadata(templateName: string): TemplateMetadata | null {
  const metadataPath = getTemplateMetadataPath(templateName);

  if (!fs.existsSync(metadataPath)) {
    return null;
  }

  try {
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    return metadata;
  } catch (error) {
    console.error(chalk.red(`Error reading template metadata for ${templateName}:`, error));
    return null;
  }
}

/**
 * Save template metadata
 */
export function saveTemplateMetadata(templateName: string, metadata: TemplateMetadata): void {
  const metadataPath = getTemplateMetadataPath(templateName);
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
}

/**
 * Get list of all available templates
 */
export function listTemplates(): TemplateInfo[] {
  ensureTemplateDirectory();

  if (!fs.existsSync(TEMPLATE_DIR)) {
    return [];
  }

  const templates: TemplateInfo[] = [];
  const entries = fs.readdirSync(TEMPLATE_DIR);

  for (const entry of entries) {
    const templatePath = path.join(TEMPLATE_DIR, entry);
    if (fs.lstatSync(templatePath).isDirectory()) {
      const metadata = getTemplateMetadata(entry);
      templates.push({
        name: entry,
        path: templatePath,
        metadata: metadata || {
          templateName: entry,
          originalName: entry,
          createdAt: new Date().toISOString(),
          version: '1.0.0'
        },
        exists: true
      });
    }
  }

  return templates;
}

/**
 * Escape special characters for regex
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Apply naming conventions to content with enhanced pattern matching
 */
export function applyNamingConventions(
  content: string,
  oldName: string,
  newName: string,
  preserveCase: boolean = false
): string {
  let transformed = content;

  // PRIORITY: Apply singular form transformations FIRST (more specific)
  const singularOld = oldName.endsWith('s') ? oldName.slice(0, -1) : oldName;
  const singularNew = newName.endsWith('s') ? newName.slice(0, -1) : newName;

  if (singularOld !== oldName && singularNew !== newName) {
    Object.entries(namingConventions).forEach(([key, fn]) => {
      const oldVal = fn(singularOld);
      const newVal = fn(singularNew);

      if (oldVal !== newVal) {
        transformed = applyPatternTransformations(transformed, oldVal, newVal, preserveCase);
      }
    });
  }

  // Then apply transformations for the main (plural) name
  Object.entries(namingConventions).forEach(([key, fn]) => {
    const oldVal = fn(oldName);
    const newVal = fn(newName);

    // Skip if the transformed values are the same
    if (oldVal === newVal) return;

    transformed = applyPatternTransformations(transformed, oldVal, newVal, preserveCase);
  });

  return transformed;
}

/**
 * Enhanced word boundary replacement
 */
function replaceWithWordBoundaries(
  str: string, 
  oldVal: string, 
  newVal: string,
  preserveCase: boolean = false
): string {
  const flags = preserveCase ? 'g' : 'gi';
  // Match word boundaries but avoid partial matches
  const regex = new RegExp(`\\b${escapeRegExp(oldVal)}\\b`, flags);
  return str.replace(regex, newVal);
}

/**
 * Apply comprehensive pattern transformations for better name matching
 */
function applyPatternTransformations(
  content: string,
  oldVal: string,
  newVal: string,
  preserveCase: boolean
): string {
  let transformed = content;
  const flags = preserveCase ? 'g' : 'gi';

  // Get all naming convention variants
  const pascalOld = namingConventions.pascal(oldVal);
  const pascalNew = namingConventions.pascal(newVal);
  const camelOld = namingConventions.camel(oldVal);
  const camelNew = namingConventions.camel(newVal);
  const constantOld = namingConventions.constant(oldVal);
  const constantNew = namingConventions.constant(newVal);

  // PASS 0: Protect common tech terms
  const protectedMap = new Map();
  PROTECTED_TERMS.forEach((term, index) => {
    const placeholder = `__PROTECTED_${index}__`;
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    transformed = transformed.replace(regex, (match) => {
      const key = `__PROTECTED_${index}_${protectedMap.size}__`;
      protectedMap.set(key, match);
      return key;
    });
  });

  // PASS 1: Exact word boundaries
  if (oldVal !== newVal) {
    transformed = replaceWithWordBoundaries(transformed, oldVal, newVal, preserveCase);
  }

  // ... (other transformation passes remain the same) ...

  // PASS 11: Restore protected terms
  protectedMap.forEach((originalTerm, placeholder) => {
    transformed = transformed.replace(new RegExp(placeholder, 'g'), originalTerm);
  });

  return transformed;
}

/**
 * Apply naming conventions to a filename with enhanced file-specific patterns
 */
export function transformFileName(
  fileName: string,
  oldName: string,
  newName: string
): string {
  let transformed = fileName;

  // Get all naming convention variants
  const pascalOld = namingConventions.pascal(oldName);
  const pascalNew = namingConventions.pascal(newName);
  const camelOld = namingConventions.camel(oldName);
  const camelNew = namingConventions.camel(newName);

  // Handle both plural and singular forms for filenames
  const singularOld = oldName.endsWith('s') ? oldName.slice(0, -1) : oldName;
  const singularNew = newName.endsWith('s') ? newName.slice(0, -1) : newName;
  const singularPascalOld = namingConventions.pascal(singularOld);
  const singularPascalNew = namingConventions.pascal(singularNew);

  // Apply comprehensive filename transformations

  // 1. Handle hook files with singular form
  if (singularPascalOld !== singularPascalNew) {
    const hookFileRegex = new RegExp(`^use${escapeRegExp(singularPascalOld)}([A-Z].*)?\\.(ts|tsx|js|jsx)$`, 'i');
    if (hookFileRegex.test(transformed)) {
      transformed = transformed.replace(hookFileRegex, `use${singularPascalNew}$1.$2`);
    }
  }

  // 2. Handle data/type files
  if (pascalOld !== pascalNew) {
    const dataFileRegex = new RegExp(`^${escapeRegExp(pascalOld)}([A-Z].*)?\\.(ts|tsx|js|jsx)$`, 'i');
    if (dataFileRegex.test(transformed)) {
      transformed = transformed.replace(dataFileRegex, `${pascalNew}$1.$2`);
    }
  }

  // 3. Handle singular type files
  if (singularPascalOld !== singularPascalNew) {
    const singularFileRegex = new RegExp(`^${escapeRegExp(singularPascalOld)}\\.(ts|tsx|js|jsx)$`, 'i');
    transformed = transformed.replace(singularFileRegex, `${singularPascalNew}.$1`);
  }

  // 4. Handle function files
  if (singularPascalOld !== singularPascalNew) {
    const funcFileRegex = new RegExp(`^(get|set|create|update|delete|handle)${escapeRegExp(singularPascalOld)}([A-Z].*)?\\.(ts|tsx|js|jsx)$`, 'i');
    if (funcFileRegex.test(transformed)) {
      transformed = transformed.replace(funcFileRegex, `$1${singularPascalNew}$2.$3`);
    }
  }

  // 5. Apply standard content naming conventions
  transformed = applyNamingConventions(transformed, oldName, newName);

  // 6. Final safety: Global case-insensitive replacement
  const globalRegex = new RegExp(escapeRegExp(oldName), 'gi');
  transformed = transformed.replace(globalRegex, newName);

  return transformed;
}// Add to types/template-types.ts
export interface TransformationValidation {
  passed: boolean;
  errors: string[];
  warnings: string[];
}


/**
 * Comprehensive validation for transformations
 */
export function validateTransformation(
  content: string,
  fileName: string,
  oldName: string,
  newName: string
): TransformationValidation {
  const result: TransformationValidation = {
    passed: true,
    errors: [],
    warnings: []
  };

  // 1. Check for invalid hybrid names
  const hybridPattern = new RegExp(
    `${escapeRegExp(oldName[0])}[a-z]*${escapeRegExp(newName)}`,
    'i'
  );
  
  if (hybridPattern.test(content) || hybridPattern.test(fileName)) {
    result.passed = false;
    result.errors.push(`Hybrid name pattern detected: ${hybridPattern}`);
  }

  // 2. Check for protected term violations
  PROTECTED_TERMS.forEach(term => {
    const termRegex = new RegExp(`\\b${term}\\b`, 'gi');
    const originalTerm = content.match(termRegex)?.[0] || '';
    
    if (originalTerm) {
      const transformed = applyNamingConventions(originalTerm, oldName, newName);
      if (transformed.toLowerCase() !== originalTerm.toLowerCase()) {
        result.passed = false;
        result.errors.push(`Protected term '${term}' transformed to '${transformed}'`);
      }
    }
  });

  // 3. Verify case preservation
  if (/[A-Z]/.test(oldName)) {
    const caseSensitiveRegex = new RegExp(escapeRegExp(newName), 'g');
    const matches = content.match(caseSensitiveRegex) || [];
    
    matches.forEach(match => {
      if (match !== newName) {
        result.warnings.push(`Case inconsistency: '${match}' should be '${newName}'`);
      }
    });
  }

  // 4. Validate complete transformation
  const oldVariants = Object.values(namingConventions).map(fn => fn(oldName));
  const untransformed = oldVariants.filter(variant => 
    content.includes(variant) || fileName.includes(variant)
  );
  
  if (untransformed.length > 0) {
    result.passed = false;
    result.errors.push(
      `Untransformed variants found: ${untransformed.join(', ')}`
    );
  }

  return result;
}

/**
 * Enhanced transformation with validation and retries
 */
export function safeApplyNamingConventions(
  content: string,
  fileName: string,
  oldName: string,
  newName: string,
  maxRetries: number = 2
): { content: string; fileName: string; valid: boolean; validation?: TransformationValidation } {
  let transformedContent = content;
  let transformedFileName = fileName;
  let attempt = 0;
  let validation: TransformationValidation;

  do {
    // Apply transformations
    transformedContent = applyNamingConventions(transformedContent, oldName, newName);
    transformedFileName = transformFileName(transformedFileName, oldName, newName);
    
    // Validate results
    validation = validateTransformation(
      transformedContent,
      transformedFileName,
      oldName,
      newName
    );
    
    // Apply fixes for common issues
    if (!validation.passed) {
      // Fix hybrid names
      if (validation.errors.some(e => e.includes('Hybrid name'))) {
        transformedContent = transformedContent.replace(
          new RegExp(`(${oldName[0]}[a-z]*)?${newName}`, 'gi'),
          newName
        );
      }
      
      // Restore protected terms
      PROTECTED_TERMS.forEach(term => {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        transformedContent = transformedContent.replace(regex, term);
      });
    }
    
    attempt++;
  } while (!validation.passed && attempt <= maxRetries);

  return {
    content: transformedContent,
    fileName: transformedFileName,
    valid: validation.passed,
    validation
  };
}

/**
 * Check if a file should be processed (not binary)
 */
export function shouldProcessFile(filePath: string): boolean {
  const textExtensions = [
    '.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte',
    '.css', '.scss', '.sass', '.less', '.styl',
    '.html', '.htm', '.xml', '.svg',
    '.json', '.yaml', '.yml', '.toml',
    '.md', '.mdx', '.txt', '.gitignore',
    '.env', '.env.example', '.env.local'
  ];

  const ext = path.extname(filePath).toLowerCase();
  return textExtensions.includes(ext) || !ext; // Include extensionless files
}

/**
 * Get all files in a directory recursively
 */
export function getAllFiles(dirPath: string): string[] {
  const files: string[] = [];

  const traverse = (currentPath: string) => {
    const entries = fs.readdirSync(currentPath);

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry);
      const stat = fs.lstatSync(fullPath);

      if (stat.isDirectory()) {
        // Skip node_modules, .git, and other common ignore patterns
        if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(entry)) {
          traverse(fullPath);
        }
      } else {
        files.push(fullPath);
      }
    }
  };

  traverse(dirPath);
  return files;
}

/**
 * Save a directory as a template
 */
export function saveTemplate(options: TemplateSaveOptions): boolean {
  try {
    const { sourcePath, templateName, originalName, description, author, tags } = options;

    if (!fs.existsSync(sourcePath)) {
      console.error(chalk.red(`Source path not found: ${sourcePath}`));
      return false;
    }

    if (templateExists(templateName)) {
      console.error(chalk.red(`Template "${templateName}" already exists. Use --replace to overwrite.`));
      return false;
    }

    ensureTemplateDirectory();
    const templatePath = getTemplatePath(templateName);

    // Copy the directory structure
    console.log(chalk.blue('📁 Copying template files...'));
    fs.cpSync(sourcePath, templatePath, { recursive: true, force: true });

    // Get list of copied files
    const files = getAllFiles(templatePath).map(f => path.relative(templatePath, f));

    // Create metadata
    const metadata: TemplateMetadata = {
      templateName,
      originalName: originalName || path.basename(sourcePath),
      description: description || `Template created from ${sourcePath}`,
      author: author || 'Unknown',
      createdAt: new Date().toISOString(),
      version: '1.0.0',
      tags: tags || [],
      files,
      dependencies: [] // Could be enhanced to detect dependencies
    };

    saveTemplateMetadata(templateName, metadata);

    console.log(chalk.green(`✅ Template "${templateName}" saved successfully!`));
    console.log(chalk.blue(`📍 Location: ${templatePath}`));
    console.log(chalk.cyan(`📄 Files copied: ${files.length}`));

    return true;
  } catch (error) {
    console.error(chalk.red('Error saving template:'), error);
    return false;
  }
}

/**
 * Generate files from a template
 */
export function generateFromTemplate(options: TemplateGenerationOptions): boolean {
  try {
    const { templateName, newName, targetPath, namingConvention, replace } = options;

    if (!templateExists(templateName)) {
      console.error(chalk.red(`Template "${templateName}" not found.`));
      console.log(chalk.yellow('Available templates:'));
      const templates = listTemplates();
      templates.forEach(t => console.log(chalk.cyan(`  - ${t.name}`)));
      return false;
    }

    const templatePath = getTemplatePath(templateName);
    const metadata = getTemplateMetadata(templateName);
    const originalName = metadata?.originalName || templateName;

    const targetDir = path.resolve(targetPath);

    if (fs.existsSync(targetDir) && !replace) {
      console.error(chalk.red(`Target directory already exists: ${targetDir}`));
      console.log(chalk.yellow('Use --replace to overwrite existing files.'));
      return false;
    }

    console.log(chalk.blue('🎯 Generating from template...'));
    console.log(chalk.cyan(`Template: ${templateName}`));
    console.log(chalk.cyan(`Target: ${targetDir}`));
    console.log(chalk.cyan(`Name transformation: ${originalName} → ${newName}`));

    // Create report file for transformation issues
    const reportPath = path.join(targetDir, 'transformation-report.log');
    if (fs.existsSync(reportPath)) fs.unlinkSync(reportPath);

    // Recursive copy with transformations
    const transformFiles = (srcDir: string, destDir: string) => {
      createFolder(destDir);
      
      const entries = fs.readdirSync(srcDir);
      
      for (const entry of entries) {
        // Skip metadata file
        if (entry === TEMPLATE_METADATA_FILE) continue;
        
        const srcPath = path.join(srcDir, entry);
        let transformedName = transformFileName(entry, originalName, newName);
        let destPath = path.join(destDir, transformedName);
        
        if (fs.lstatSync(srcPath).isDirectory()) {
          transformFiles(srcPath, destPath);
        } else {
          if (shouldProcessFile(srcPath)) {
            // Process text files
            let content = fs.readFileSync(srcPath, 'utf8');
            
            // Use safe transformation with validation
            const result = safeApplyNamingConventions(
              content,
              transformedName,
              originalName,
              newName
            );
            
            // Apply final transformations
            content = result.content;
            transformedName = result.fileName;
            destPath = path.join(destDir, transformedName);
            
            // Write validation report
            if (result.validation && !result.valid) {
              const report = [
                `File: ${transformedName}`,
                `Issues:`,
                ...result.validation.errors.map(e => `  - ${e}`),
                ...result.validation.warnings.map(w => `  - [WARN] ${w}`),
                ''
              ].join('\n');
              
              fs.appendFileSync(reportPath, report);
            }
            
            fs.writeFileSync(destPath, content);
          } else {
            // Copy binary files as-is
            fs.copyFileSync(srcPath, destPath);
          }
        }
      }
    };

    // Create target directory if it doesn't exist
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    transformFiles(templatePath, targetDir);

    // Check if transformation report exists
    if (fs.existsSync(reportPath)) {
      const issueCount = fs.readFileSync(reportPath, 'utf8').split('\n').filter(l => l.startsWith('  -')).length;
      console.log(chalk.yellow(`⚠️  Transformation completed with ${issueCount} issues. See ${reportPath}`));
    } else {
      console.log(chalk.green('✅ All transformations passed validation checks'));
    }

    console.log(chalk.green(`🎉 Successfully generated "${newName}" from template "${templateName}"`));
    console.log(chalk.blue(`📍 Location: ${targetDir}`));

    if (metadata?.files) {
      console.log(chalk.cyan(`📄 Files generated: ${metadata.files.length}`));
    }

    return true;
  } catch (error) {
    console.error(chalk.red('Error generating from template:'), error);
    return false;
  }
}