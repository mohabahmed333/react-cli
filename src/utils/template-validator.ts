import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { namingConventions } from './template';

export interface ValidationOptions {
  detailed?: boolean;
  fix?: boolean;
}

export interface ValidationIssue {
  file: string;
  patterns: Array<{
    line: number;
    oldPattern: string;
    suggested: string;
    context: string;
  }>;
}

export interface ValidationResult {
  success: boolean;
  filesScanned: number;
  issuesFound: number;
  issues: ValidationIssue[];
}

/**
 * Generate all possible naming patterns from the original name
 */
function generateNamePatterns(name: string): string[] {
  const patterns: string[] = [];
  
  // Basic naming conventions
  Object.values(namingConventions).forEach(fn => {
    const transformed = fn(name);
    if (transformed && !patterns.includes(transformed)) {
      patterns.push(transformed);
    }
  });

  // Singular form if name is plural
  const singular = name.endsWith('s') ? name.slice(0, -1) : name;
  if (singular !== name) {
    Object.values(namingConventions).forEach(fn => {
      const transformed = fn(singular);
      if (transformed && !patterns.includes(transformed)) {
        patterns.push(transformed);
      }
    });
  }

  return patterns;
}

/**
 * Generate comprehensive regex patterns to find old naming
 */
function generateSearchPatterns(oldName: string): Array<{ pattern: RegExp; description: string; suggestion: string }> {
  const patterns: Array<{ pattern: RegExp; description: string; suggestion: string }> = [];
  const oldPatterns = generateNamePatterns(oldName);

  oldPatterns.forEach(oldPattern => {
    if (!oldPattern) return;

    // Exact word boundaries
    patterns.push({
      pattern: new RegExp(`\\b${escapeRegExp(oldPattern)}\\b`, 'gi'),
      description: `Exact match: ${oldPattern}`,
      suggestion: `Replace with appropriate new naming convention`
    });

    // Type prefixes
    patterns.push({
      pattern: new RegExp(`\\b([TI])${escapeRegExp(oldPattern)}\\b`, 'gi'),
      description: `Type prefix: T${oldPattern} or I${oldPattern}`,
      suggestion: `Update type prefix`
    });

    // Function prefixes
    const functionPrefixes = ['use', 'get', 'set', 'handle', 'on', 'is', 'has', 'can', 'should', 'will', 'open', 'close', 'toggle', 'show', 'hide'];
    functionPrefixes.forEach(prefix => {
      patterns.push({
        pattern: new RegExp(`\\b${prefix}${escapeRegExp(oldPattern)}([A-Z][a-z]|\\b)`, 'gi'),
        description: `Function: ${prefix}${oldPattern}...`,
        suggestion: `Update function name`
      });
    });

    // Interface/Type suffixes
    const suffixes = ['Props', 'State', 'Config', 'Options', 'Data', 'Response', 'Request', 'Type', 'Interface', 'Modal', 'ModalState', 'Columns', 'ColumnsProps'];
    suffixes.forEach(suffix => {
      patterns.push({
        pattern: new RegExp(`\\b${escapeRegExp(oldPattern)}${suffix}\\b`, 'gi'),
        description: `Interface: ${oldPattern}${suffix}`,
        suggestion: `Update interface name`
      });
    });

    // Compound words
    patterns.push({
      pattern: new RegExp(`\\b${escapeRegExp(oldPattern)}([A-Z][a-z])`, 'gi'),
      description: `Compound word: ${oldPattern}...`,
      suggestion: `Update compound word`
    });

    patterns.push({
      pattern: new RegExp(`\\b([A-Z][a-z]+)${escapeRegExp(oldPattern)}\\b`, 'gi'),
      description: `Compound word: ...${oldPattern}`,
      suggestion: `Update compound word`
    });

    // camelCase variables
    const camelPattern = oldPattern.charAt(0).toLowerCase() + oldPattern.slice(1);
    patterns.push({
      pattern: new RegExp(`\\b${escapeRegExp(camelPattern)}([A-Z][a-z]|\\b)`, 'gi'),
      description: `camelCase: ${camelPattern}...`,
      suggestion: `Update camelCase variable`
    });

    // Constants and enums
    const constantPattern = oldPattern.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
    patterns.push({
      pattern: new RegExp(`\\b${escapeRegExp(constantPattern)}(_[A-Z_]+|\\b)`, 'gi'),
      description: `Constant: ${constantPattern}...`,
      suggestion: `Update constant name`
    });

    // File paths and imports
    patterns.push({
      pattern: new RegExp(`(['"]\\.?\\/[^'"]*\\/)${escapeRegExp(oldPattern)}(['"\\s])`, 'gi'),
      description: `File path: .../.../${oldPattern}`,
      suggestion: `Update import path`
    });

    // Object property access
    patterns.push({
      pattern: new RegExp(`\\.${escapeRegExp(camelPattern)}\\b`, 'gi'),
      description: `Property access: .${camelPattern}`,
      suggestion: `Update property name`
    });
  });

  return patterns;
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Scan a file for old naming patterns
 */
async function scanFile(filePath: string, oldName: string, newName: string): Promise<ValidationIssue | null> {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const searchPatterns = generateSearchPatterns(oldName);
    const newPatterns = generateNamePatterns(newName);
    
    const foundPatterns: Array<{
      line: number;
      oldPattern: string;
      suggested: string;
      context: string;
    }> = [];

    lines.forEach((line, index) => {
      searchPatterns.forEach(({ pattern, description, suggestion }) => {
        const matches = line.match(pattern);
        if (matches) {
          matches.forEach(match => {
            // Skip if this pattern has already been converted to the new naming
            const isAlreadyConverted = newPatterns.some(newPattern => 
              line.toLowerCase().includes(newPattern.toLowerCase())
            );
            
            if (!isAlreadyConverted) {
              foundPatterns.push({
                line: index + 1,
                oldPattern: match,
                suggested: suggestion,
                context: line.trim()
              });
            }
          });
        }
      });
    });

    if (foundPatterns.length > 0) {
      return {
        file: filePath,
        patterns: foundPatterns
      };
    }

    return null;
  } catch (error) {
    console.error(chalk.red(`Error scanning file ${filePath}:`, error));
    return null;
  }
}

/**
 * Get all files to scan in a directory
 */
function getAllFilesToScan(dirPath: string): string[] {
  const files: string[] = [];
  
  const traverse = (currentPath: string) => {
    if (!fs.existsSync(currentPath)) return;
    
    const entries = fs.readdirSync(currentPath);
    
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry);
      const stat = fs.lstatSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip common ignore patterns
        if (!['node_modules', '.git', '.next', 'dist', 'build', '.templates'].includes(entry)) {
          traverse(fullPath);
        }
      } else {
        // Only scan text files
        const textExtensions = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.css', '.scss', '.json', '.md'];
        const ext = path.extname(fullPath).toLowerCase();
        if (textExtensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  };
  
  traverse(dirPath);
  return files;
}

/**
 * Apply fixes to a file with old naming patterns
 */
async function fixFile(filePath: string, oldName: string, newName: string): Promise<number> {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Apply the same comprehensive transformations used in template generation
    const { applyNamingConventions } = require('./template');
    
    // Apply transformations for both plural and singular forms
    content = applyNamingConventions(content, oldName, newName);
    
    // Also try singular form transformations
    const singularOld = oldName.endsWith('s') ? oldName.slice(0, -1) : oldName;
    const singularNew = newName.endsWith('s') ? newName.slice(0, -1) : newName;
    
    if (singularOld !== oldName && singularNew !== newName) {
      content = applyNamingConventions(content, singularOld, singularNew);
    }
    
    // Count the number of changes made
    const changes = originalContent !== content ? 1 : 0;
    
    if (changes > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
    
    return changes;
  } catch (error) {
    console.error(chalk.red(`Error fixing file ${filePath}:`, error));
    return 0;
  }
}

/**
 * Validate transformations in a generated feature
 */
export async function validateTransformations(
  generatedPath: string,
  originalName: string,
  newName: string,
  options: ValidationOptions = {}
): Promise<ValidationResult> {
  console.log(chalk.blue('🔍 Scanning for remaining old naming patterns...'));
  
  const filesToScan = getAllFilesToScan(generatedPath);
  let issues: ValidationIssue[] = [];
  let filesScanned = 0;
  let filesFixed = 0;

  // If fixing, apply fixes first, then re-scan
  if (options.fix) {
    console.log(chalk.blue('🔧 Applying comprehensive fixes...'));
    
    for (const filePath of filesToScan) {
      const changes = await fixFile(filePath, originalName, newName);
      if (changes > 0) {
        filesFixed++;
      }
      
      // Show progress
      if (filesScanned % 10 === 0) {
        process.stdout.write(chalk.gray('.'));
      }
      filesScanned++;
    }
    
    if (filesScanned >= 10) {
      console.log(''); // New line after progress dots
    }
    
    console.log(chalk.green(`✅ Applied fixes to ${filesFixed} files`));
    console.log(chalk.blue('🔍 Re-scanning to verify fixes...'));
    
    // Reset for re-scanning
    filesScanned = 0;
  }

  // Scan for remaining issues
  for (const filePath of filesToScan) {
    const issue = await scanFile(filePath, originalName, newName);
    if (issue) {
      issues.push(issue);
    }
    filesScanned++;
    
    // Show progress for large scans
    if (filesScanned % 10 === 0) {
      process.stdout.write(chalk.gray('.'));
    }
  }

  if (filesScanned >= 10) {
    console.log(''); // New line after progress dots
  }

  const success = issues.length === 0;
  const issuesFound = issues.reduce((total, issue) => total + issue.patterns.length, 0);

  return {
    success,
    filesScanned,
    issuesFound,
    issues
  };
} 