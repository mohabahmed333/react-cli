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
  NamingConventionType 
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
 * Apply naming conventions to content
 */
export function applyNamingConventions(
  content: string, 
  oldName: string, 
  newName: string,
  preserveCase: boolean = false
): string {
  let transformed = content;
  
  // Apply all naming conventions
  Object.entries(namingConventions).forEach(([key, fn]) => {
    const oldVal = fn(oldName);
    const newVal = fn(newName);
    
    // Skip if the transformed values are the same
    if (oldVal === newVal) return;
    
    // Create regex with word boundaries for better matching
    const regex = new RegExp(`\\b${escapeRegExp(oldVal)}\\b`, preserveCase ? 'g' : 'gi');
    transformed = transformed.replace(regex, newVal);
  });

  return transformed;
}

/**
 * Escape special characters for regex
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Apply naming conventions to a filename
 */
export function transformFileName(
  fileName: string, 
  oldName: string, 
  newName: string
): string {
  return applyNamingConventions(fileName, oldName, newName);
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

    // Recursive copy with transformations
    const transformFiles = (srcDir: string, destDir: string) => {
      createFolder(destDir);
      
      const entries = fs.readdirSync(srcDir);
      
      for (const entry of entries) {
        // Skip metadata file
        if (entry === TEMPLATE_METADATA_FILE) continue;
        
        const srcPath = path.join(srcDir, entry);
        const transformedName = transformFileName(entry, originalName, newName);
        const destPath = path.join(destDir, transformedName);
        
        if (fs.lstatSync(srcPath).isDirectory()) {
          transformFiles(srcPath, destPath);
        } else {
          if (shouldProcessFile(srcPath)) {
            // Process text files
            let content = fs.readFileSync(srcPath, 'utf8');
            content = applyNamingConventions(content, originalName, newName);
            fs.writeFileSync(destPath, content);
          } else {
            // Copy binary files as-is
            fs.copyFileSync(srcPath, destPath);
          }
        }
      }
    };

    transformFiles(templatePath, targetDir);

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