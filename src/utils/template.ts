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
 * Apply naming conventions to content with enhanced pattern matching
 */
export function applyNamingConventions(
  content: string, 
  oldName: string, 
  newName: string,
  preserveCase: boolean = false
): string {
  let transformed = content;
  
  // Apply transformations for the main name
  Object.entries(namingConventions).forEach(([key, fn]) => {
    const oldVal = fn(oldName);
    const newVal = fn(newName);
    
    // Skip if the transformed values are the same
    if (oldVal === newVal) return;
    
    transformed = applyPatternTransformations(transformed, oldVal, newVal, preserveCase);
  });

  // Also apply transformations for singular forms
  // If oldName is plural (ends with 's'), also transform the singular form
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

  return transformed;
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
  
  // Apply multiple passes for comprehensive transformation
  
  // PASS 1: Exact word boundaries
  if (oldVal !== newVal) {
    const wordBoundaryRegex = new RegExp(`\\b${escapeRegExp(oldVal)}\\b`, flags);
    transformed = transformed.replace(wordBoundaryRegex, newVal);
  }
  
  // PASS 2: PascalCase patterns
  if (pascalOld !== pascalNew && pascalOld.length > 0) {
    // Exact PascalCase matches
    const exactPascalRegex = new RegExp(`\\b${escapeRegExp(pascalOld)}\\b`, flags);
    transformed = transformed.replace(exactPascalRegex, pascalNew);
    
    // Type prefixes: TOrder → TCustomer, IOrder → ICustomer
    const typePrefixRegex = new RegExp(`\\b([TI])${escapeRegExp(pascalOld)}\\b`, flags);
    transformed = transformed.replace(typePrefixRegex, `$1${pascalNew}`);
    
    // Compound words at start: OrderStatus → CustomerStatus
    const compoundStartRegex = new RegExp(`\\b${escapeRegExp(pascalOld)}([A-Z][a-z])`, flags);
    transformed = transformed.replace(compoundStartRegex, `${pascalNew}$1`);
    
    // Compound words at end: GetOrderColumns → GetCustomerColumns
    const compoundEndRegex = new RegExp(`\\b([A-Z][a-z]+)${escapeRegExp(pascalOld)}\\b`, flags);
    transformed = transformed.replace(compoundEndRegex, `$1${pascalNew}`);
  }
  
  // PASS 3: camelCase patterns
  if (camelOld !== camelNew && camelOld.length > 0) {
    // Exact camelCase matches
    const exactCamelRegex = new RegExp(`\\b${escapeRegExp(camelOld)}\\b`, flags);
    transformed = transformed.replace(exactCamelRegex, camelNew);
    
    // camelCase compound words: orderModal → customerModal
    const camelCompoundRegex = new RegExp(`\\b${escapeRegExp(camelOld)}([A-Z][a-z])`, flags);
    transformed = transformed.replace(camelCompoundRegex, `${camelNew}$1`);
    
    // Variables with camelCase: selectedOrder → selectedCustomer
    const selectedRegex = new RegExp(`\\bselected${escapeRegExp(pascalOld)}\\b`, flags);
    transformed = transformed.replace(selectedRegex, `selected${pascalNew}`);
    
    // Property access: .orderModal → .customerModal
    const propertyRegex = new RegExp(`\\.${escapeRegExp(camelOld)}\\b`, flags);
    transformed = transformed.replace(propertyRegex, `.${camelNew}`);
  }
  
  // PASS 4: Function patterns with comprehensive prefixes
  if (pascalOld !== pascalNew && pascalOld.length > 0) {
    const functionPrefixes = ['use', 'get', 'set', 'handle', 'on', 'is', 'has', 'can', 'should', 'will', 'open', 'close', 'toggle', 'show', 'hide', 'create', 'update', 'delete', 'find', 'search'];
    
    functionPrefixes.forEach(prefix => {
      // Function names: useOrderModal → useCustomerModal
      const funcRegex = new RegExp(`\\b${prefix}${escapeRegExp(pascalOld)}([A-Z][a-z]+|\\b)`, flags);
      transformed = transformed.replace(funcRegex, `${prefix}${pascalNew}$1`);
      
      // Also handle camelCase prefix: useOrderModal where 'use' + 'Order' + 'Modal'
      const camelFuncRegex = new RegExp(`\\b${prefix}${escapeRegExp(pascalOld)}([A-Z])`, flags);
      transformed = transformed.replace(camelFuncRegex, `${prefix}${pascalNew}$1`);
    });
  }
  
  // PASS 5: Interface and type suffixes
  if (pascalOld !== pascalNew && pascalOld.length > 0) {
    const commonSuffixes = ['Props', 'State', 'Config', 'Options', 'Data', 'Response', 'Request', 'Type', 'Interface', 'Modal', 'ModalState', 'Columns', 'ColumnsProps', 'Handler', 'Service', 'Repository', 'Controller'];
    
    commonSuffixes.forEach(suffix => {
      const suffixRegex = new RegExp(`\\b${escapeRegExp(pascalOld)}${suffix}\\b`, flags);
      transformed = transformed.replace(suffixRegex, `${pascalNew}${suffix}`);
    });
  }
  
  // PASS 6: ID and identifier patterns
  if (pascalOld !== pascalNew && pascalOld.length > 0) {
    // Handle orderId → customerId patterns
    const idRegex = new RegExp(`\\b${escapeRegExp(camelOld)}Id\\b`, flags);
    transformed = transformed.replace(idRegex, `${camelNew}Id`);
    
    // Handle OrderId → CustomerId patterns
    const IdRegex = new RegExp(`\\b${escapeRegExp(pascalOld)}Id\\b`, flags);
    transformed = transformed.replace(IdRegex, `${pascalNew}Id`);
    
    // Handle object property patterns: .orderId → .customerId
    const propIdRegex = new RegExp(`\\.${escapeRegExp(camelOld)}Id\\b`, flags);
    transformed = transformed.replace(propIdRegex, `.${camelNew}Id`);
    
    // Handle JSON key patterns: "orderId": → "customerId":
    const jsonIdRegex = new RegExp(`"${escapeRegExp(camelOld)}Id"`, flags);
    transformed = transformed.replace(jsonIdRegex, `"${camelNew}Id"`);
  }
  
  // PASS 7: Constant and enum patterns
  if (constantOld !== constantNew && constantOld.length > 0) {
    // Enum constants: ORDER_STATUS → CUSTOMER_STATUS
    const enumRegex = new RegExp(`\\b${escapeRegExp(constantOld)}_([A-Z_]+)\\b`, flags);
    transformed = transformed.replace(enumRegex, `${constantNew}_$1`);
    
    // Standalone constants
    const constantRegex = new RegExp(`\\b${escapeRegExp(constantOld)}\\b`, flags);
    transformed = transformed.replace(constantRegex, constantNew);
  }
  
  // PASS 8: File path and import patterns
  if (pascalOld !== pascalNew) {
    // Import paths: './types/Orders' → './types/Customers'
    const pathRegex = new RegExp(`(['"]\\.?\\/[^'"]*\\/)${escapeRegExp(pascalOld)}(['"\\s])`, flags);
    transformed = transformed.replace(pathRegex, `$1${pascalNew}$2`);
    
    // Import statements: from './useOrderModal' → from './useCustomerModal'
    const importRegex = new RegExp(`(from\\s+['"]\\.\\/)${escapeRegExp(camelOld)}(['"\\s])`, flags);
    transformed = transformed.replace(importRegex, `$1${camelNew}$2`);
  }
  
  // PASS 9: JSX and component patterns
  if (pascalOld !== pascalNew && pascalOld.length > 0) {
    // Component names in JSX: <OrderModal> → <CustomerModal>
    const jsxRegex = new RegExp(`<${escapeRegExp(pascalOld)}([\\s>])`, flags);
    transformed = transformed.replace(jsxRegex, `<${pascalNew}$1`);
    
    const jsxCloseRegex = new RegExp(`<\\/${escapeRegExp(pascalOld)}>`, flags);
    transformed = transformed.replace(jsxCloseRegex, `</${pascalNew}>`);
  }
  
  // PASS 10: Additional comprehensive patterns
  if (pascalOld !== pascalNew && pascalOld.length > 0) {
    // Variable declarations: const order = → const customer =
    const varRegex = new RegExp(`\\b(const|let|var)\\s+${escapeRegExp(camelOld)}\\b`, flags);
    transformed = transformed.replace(varRegex, `$1 ${camelNew}`);
    
    // Function parameters: (order: TOrder) → (customer: TCustomer)
    const paramRegex = new RegExp(`\\(${escapeRegExp(camelOld)}:`, flags);
    transformed = transformed.replace(paramRegex, `(${camelNew}:`);
    
    // Array/object destructuring: { order } → { customer }
    const destructureRegex = new RegExp(`\\{\\s*${escapeRegExp(camelOld)}\\s*\\}`, flags);
    transformed = transformed.replace(destructureRegex, `{ ${camelNew} }`);
    
    // Property access chains: order.id → customer.id
    const chainRegex = new RegExp(`\\b${escapeRegExp(camelOld)}\\.`, flags);
    transformed = transformed.replace(chainRegex, `${camelNew}.`);
    
    // Template literals and strings: "Order ID" → "Customer ID"
    const stringRegex = new RegExp(`"([^"]*?)${escapeRegExp(pascalOld)}([^"]*?)"`, flags);
    transformed = transformed.replace(stringRegex, `"$1${pascalNew}$2"`);
    
    const singleStringRegex = new RegExp(`'([^']*?)${escapeRegExp(pascalOld)}([^']*?)'`, flags);
    transformed = transformed.replace(singleStringRegex, `'$1${pascalNew}$2'`);
    
    // Accessibility keys and IDs: accessorKey: "orderId" → accessorKey: "customerId"
    const accessorRegex = new RegExp(`(accessorKey|key|id):\\s*"${escapeRegExp(camelOld)}"`, flags);
    transformed = transformed.replace(accessorRegex, `$1: "${camelNew}"`);
  }
  
  return transformed;
}

/**
 * Escape special characters for regex
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
  
  // Apply the standard naming conventions
  transformed = applyNamingConventions(transformed, oldName, newName);
  
  // Apply additional file-specific transformations
  const pascalOld = namingConventions.pascal(oldName);
  const pascalNew = namingConventions.pascal(newName);
  const camelOld = namingConventions.camel(oldName);
  const camelNew = namingConventions.camel(newName);
  
  // Handle file extensions and compound names
  if (pascalOld !== pascalNew) {
    // Transform file names like "useOrderModal.ts" → "useCustomerModal.ts"
    const fileRegex = new RegExp(`^use${escapeRegExp(pascalOld)}([A-Z].*)$`, 'i');
    transformed = transformed.replace(fileRegex, `use${pascalNew}$1`);
    
    // Transform file names like "OrderData.ts" → "CustomerData.ts"
    const dataFileRegex = new RegExp(`^${escapeRegExp(pascalOld)}([A-Z].*)$`, 'i');
    transformed = transformed.replace(dataFileRegex, `${pascalNew}$1`);
    
    // Transform file names like "getOrderColumns.ts" → "getCustomerColumns.ts"
    const funcFileRegex = new RegExp(`^(get|set|create|update|delete)${escapeRegExp(pascalOld)}([A-Z].*)$`, 'i');
    transformed = transformed.replace(funcFileRegex, `$1${pascalNew}$2`);
  }
  
  return transformed;
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