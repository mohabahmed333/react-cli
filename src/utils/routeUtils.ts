import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { RouteInfo, RouteConfig, ParsedRoute } from '../types/route-types';
import { CLIConfig } from './config';
import { createFile, createFolder } from './file';

/**
 * Parse page path to route information
 */
export function parsePagePathToRoute(
  pageName: string, 
  targetDir: string, 
  config: CLIConfig
): RouteInfo {
  console.log(chalk.dim(`🔍 Parsing: pageName=${pageName}, targetDir=${targetDir}, baseDir=${config.baseDir}`));
  
  // Get relative path from base directory  
  const relativePath = path.relative(config.baseDir, targetDir);
  console.log(chalk.dim(`🔍 Relative path: ${relativePath}`));
  
  const segments = relativePath.split(path.sep).filter(Boolean);
  console.log(chalk.dim(`🔍 Segments: ${JSON.stringify(segments)}`));
  
  // Remove 'pages' from segments if it exists
  const pagesIndex = segments.indexOf('pages');
  if (pagesIndex !== -1) {
    segments.splice(pagesIndex, 1);
  }
  console.log(chalk.dim(`🔍 Segments after pages removal: ${JSON.stringify(segments)}`));

  // Determine if this is a nested page
  // If segments = ['Mohab', 'Dashboard'], this is nested with parent '/mohab'
  const isNested = segments.length >= 2;
  console.log(chalk.dim(`🔍 Is nested: ${isNested} (segments.length=${segments.length})`));
  
  let parentRoute: string | undefined;
  let routePath: string;

  if (isNested) {
    // Parent is the first segment (feature folder)
    const parentFolderName = segments[0].toLowerCase();
    parentRoute = `/${parentFolderName}`;
    console.log(chalk.dim(`🔍 Parent route: ${parentRoute}`));
    
    // Full route path includes all segments plus page name
    const allSegments = [...segments.map(s => s.toLowerCase())];
    
    // Add page name if it's not the same as the last folder
    const lastFolder = segments[segments.length - 1].toLowerCase();
    const pageNameLower = pageName.toLowerCase();
    if (pageNameLower !== lastFolder && pageNameLower !== 'index') {
      allSegments.push(pageNameLower);
    }
    
    routePath = '/' + allSegments.join('/');
    console.log(chalk.dim(`🔍 Route path: ${routePath}`));
  } else {
    // Simple page at root level
    if (pageName.toLowerCase() === 'index') {
      routePath = '/';
    } else {
      routePath = `/${pageName.toLowerCase()}`;
    }
    console.log(chalk.dim(`🔍 Simple route path: ${routePath}`));
  }

  // Handle dynamic routes
  let isDynamic = false;
  if (pageName.startsWith('_[') && pageName.endsWith(']')) {
    const param = pageName.slice(2, -1);
    routePath = routePath.replace(`/${pageName.toLowerCase()}`, `/:${param}`);
    isDynamic = true;
  }

  // Generate import path relative to routes file
  const importPath = generateImportPath(targetDir, pageName, config);

  return {
    pageName,
    fullPath: targetDir,
    routePath,
    isNested,
    isDynamic,
    parentRoute,
    importPath
  };
}

/**
 * Generate import path for the page component
 */
function generateImportPath(targetDir: string, pageName: string, config: CLIConfig): string {
  const ext = config.typescript ? 'tsx' : 'jsx';
  
  // Get the routes file path to calculate relative import
  const routesPath = getRoutesFilePath(config);
  const routesDir = path.dirname(routesPath);
  const pageFile = path.join(targetDir, `${pageName}.${ext}`);
  
  let relativePath = path.relative(routesDir, pageFile);
  // Convert Windows paths to Unix-style for imports
  relativePath = relativePath.replace(/\\/g, '/');
  // Remove file extension
  relativePath = relativePath.replace(/\.(tsx|jsx)$/, '');
  // Add ./ prefix if not already there
  if (!relativePath.startsWith('./') && !relativePath.startsWith('../')) {
    relativePath = './' + relativePath;
  }
  
  return relativePath;
}

/**
 * Get the correct routes file path
 */
function getRoutesFilePath(config: CLIConfig): string {
  const ext = config.typescript ? 'tsx' : 'jsx';
  
  // Try pages/routes first (current structure)
  const pagesRoutesPath = path.resolve(config.baseDir, 'pages', 'routes', `routes.${ext}`);
  if (fs.existsSync(pagesRoutesPath)) {
    return pagesRoutesPath;
  }
  
  // Try routes folder directly under baseDir
  const routesPath = path.resolve(config.baseDir, 'routes', `routes.${ext}`);
  if (fs.existsSync(routesPath)) {
    return routesPath;
  }
  
  // Try src/routes (for src-based projects)
  const srcRoutesPath = path.resolve(config.baseDir, 'src', 'routes', `routes.${ext}`);
  if (fs.existsSync(srcRoutesPath)) {
    return srcRoutesPath;
  }
  
  // Default to pages/routes (will be created if needed)
  return pagesRoutesPath;
}

/**
 * Check if routes file exists
 */
export function routesFileExists(config: CLIConfig): boolean {
  const routesPath = getRoutesFilePath(config);
  return fs.existsSync(routesPath);
}

/**
 * Create initial routes file
 */
export function createInitialRoutesFile(config: CLIConfig): string {
  const ext = config.typescript ? 'tsx' : 'jsx';
  
  // Check if routes file already exists in pages/routes
  const pagesRoutesPath = path.resolve(config.baseDir, 'pages', 'routes', `routes.${ext}`);
  if (fs.existsSync(pagesRoutesPath)) {
    return pagesRoutesPath;
  }
  
  // Create in pages/routes to match existing structure
  const folderPath = path.resolve(config.baseDir, 'pages', 'routes');
  createFolder(folderPath);
  
  const filePath = path.join(folderPath, `routes.${ext}`);
  const content = config.typescript
    ? `import { createBrowserRouter } from 'react-router-dom';\nimport App from '../../App';\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    element: <App />,\n    children: [\n      // Routes will be automatically added here\n    ],\n  },\n]);\n\nexport default router;\n`
    : `import { createBrowserRouter } from 'react-router-dom';\nimport App from '../../App';\n\nconst router = createBrowserRouter([\n  {\n    path: '/',\n    element: <App />,\n    children: [\n      // Routes will be automatically added here\n    ],\n  },\n]);\n\nexport default router;\n`;

  createFile(filePath, content, false);
  return filePath;
}

/**
 * Convert dynamic route pattern to valid component name
 * Examples: _[id] -> DynamicId, _[productId] -> DynamicProductId
 */
function convertToValidComponentName(pageName: string): string {
  if (pageName.startsWith('_[') && pageName.endsWith(']')) {
    const param = pageName.slice(2, -1);
    // Convert camelCase to PascalCase and add Dynamic prefix
    const pascalParam = param.charAt(0).toUpperCase() + param.slice(1);
    return `Dynamic${pascalParam}`;
  }
  return pageName;
}

/**
 * Parse existing routes file to understand current structure
 */
export function parseExistingRoutes(filePath: string): { 
  content: string; 
  imports: string[]; 
  routes: RouteConfig[] 
} {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract imports (simple regex approach)
  const importRegex = /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g;
  const imports: string[] = [];
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    if (!match[2].includes('react-router-dom') && !match[2].includes('../App')) {
      imports.push(match[0]);
    }
  }

  // For now, we'll use a simple approach to detect routes
  // In a production system, you might want to use AST parsing
  const routes: RouteConfig[] = [];
  
  return { content, imports, routes };
}

/**
 * Transform existing route to support nested routing
 * Changes /parent/parent to /parent with children structure
 */
function transformParentRouteForNesting(content: string, parentPath: string): string {
  const folderName = parentPath.split('/').pop();
  if (!folderName) return content;

  // Look for pattern like /mohab/mohab and change it to /mohab
  const duplicatePattern = new RegExp(
    `(\\{[^}]*path:\\s*['"])${parentPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/${folderName}(['"][^}]*element:[^}]*)(\\})`,
    'gs'
  );

  return content.replace(duplicatePattern, `$1${parentPath}$2$3`);
}

/**
 * Find parent route in the routes structure
 */
function findParentRouteInContent(content: string, parentPath: string): { found: boolean; routeObject?: string; fullMatch?: string; needsTransformation?: boolean } {
  console.log(chalk.dim(`🔍 Looking for parent route: ${parentPath}`));
  
  // Split content into lines to find the route more precisely
  const lines = content.split('\n');
  let routeStartIndex = -1;
  let routeEndIndex = -1;
  let braceCount = 0;
  let inTargetRoute = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Look for the path line that matches our parent route
    if (line.includes(`path: '${parentPath}'`) || line.includes(`path: "${parentPath}"`)) {
      routeStartIndex = i;
      // Find the start of this route object (look backwards for opening brace)
      for (let j = i; j >= 0; j--) {
        if (lines[j].trim().endsWith('{')) {
          routeStartIndex = j;
          inTargetRoute = true;
          braceCount = 1;
          break;
        }
      }
      break;
    }
  }
  
  if (routeStartIndex === -1) {
    // Try looking for transformation pattern like /mohab/mohab
    const folderName = parentPath.split('/').pop();
    if (folderName) {
      const transformPath = `${parentPath}/${folderName}`;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes(`path: '${transformPath}'`) || line.includes(`path: "${transformPath}"`)) {
          routeStartIndex = i;
          for (let j = i; j >= 0; j--) {
            if (lines[j].trim().endsWith('{')) {
              routeStartIndex = j;
              inTargetRoute = true;
              braceCount = 1;
              break;
            }
          }
          console.log(chalk.dim(`✅ Found transformable parent route at line ${routeStartIndex}`));
          break;
        }
      }
      
      if (routeStartIndex !== -1) {
        // Find the end of the route object
        for (let i = routeStartIndex + 1; i < lines.length; i++) {
          const line = lines[i];
          const openBraces = (line.match(/\{/g) || []).length;
          const closeBraces = (line.match(/\}/g) || []).length;
          braceCount += openBraces - closeBraces;
          
          if (braceCount === 0) {
            routeEndIndex = i;
            break;
          }
        }
        
        if (routeEndIndex !== -1) {
          const routeObject = lines.slice(routeStartIndex, routeEndIndex + 1).join('\n');
          return { found: true, routeObject, fullMatch: routeObject, needsTransformation: true };
        }
      }
    }
    
    console.log(chalk.dim(`❌ Parent route not found`));
    return { found: false };
  }
  
  if (inTargetRoute) {
    // Find the end of the route object
    for (let i = routeStartIndex + 1; i < lines.length; i++) {
      const line = lines[i];
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      braceCount += openBraces - closeBraces;
      
      if (braceCount === 0) {
        routeEndIndex = i;
        break;
      }
    }
    
    if (routeEndIndex !== -1) {
      const routeObject = lines.slice(routeStartIndex, routeEndIndex + 1).join('\n');
      console.log(chalk.dim(`✅ Found exact parent route:\n${routeObject}`));
      return { found: true, routeObject, fullMatch: routeObject };
    }
  }
  
  console.log(chalk.dim(`❌ Parent route not found`));
  return { found: false };
}

/**
 * Add nested route to parent route
 */
function addNestedRouteToParent(content: string, routeEntry: string, routeInfo: RouteInfo): string {
  if (!routeInfo.parentRoute) {
    return addRouteToChildren(content, routeEntry, routeInfo);
  }

  const { found, routeObject, fullMatch, needsTransformation } = findParentRouteInContent(content, routeInfo.parentRoute);
  
  if (found && routeObject && fullMatch) {
    let workingContent = content;
    
    // If the parent route needs transformation (e.g., /mohab/mohab -> /mohab), do it first
    if (needsTransformation) {
      workingContent = transformParentRouteForNesting(workingContent, routeInfo.parentRoute);
      console.log(chalk.blue(`🔄 Transformed parent route to support nested routing`));
    }

    // Check if parent route already has children array
    if (routeObject.includes('children:')) {
      // Parent already has children, add to existing children array
      const parentPathPattern = routeInfo.parentRoute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const childrenPattern = new RegExp(
        `(\\{[^}]*path:\\s*['"]${parentPathPattern}['"][^}]*children:\\s*\\[)([^\\]]*)(\\][^}]*\\})`,
        'gs'
      );
      
      return workingContent.replace(childrenPattern, (match, before, children, after) => {
        const cleanChildren = children.trim();
        const separator = cleanChildren && !cleanChildren.startsWith('//') ? ',' : '';
        return `${before}${cleanChildren}${separator}\n${routeEntry},\n        ${after}`;
      });
    } else {
      // Parent doesn't have children, add children array
      const parentPathPattern = routeInfo.parentRoute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Find the specific parent route object and add children to it
      const parentRoutePattern = new RegExp(
        `(\\{[^}]*path:\\s*['"]${parentPathPattern}['"][^}]*element:[^}]*)(\\s*\\},?)`,
        'gs'
      );
      
      return workingContent.replace(parentRoutePattern, (match, routePart, closing) => {
        // Remove trailing comma from routePart if it exists
        const cleanRoutePart = routePart.replace(/,\s*$/, '');
        return `${cleanRoutePart},\n        children: [\n${routeEntry},\n        ]${closing}`;
      });
    }
  }
  
  // Fallback: add as top-level route
  console.log(chalk.yellow(`⚠️ Parent route ${routeInfo.parentRoute} not found, adding as top-level route`));
  return addRouteToChildren(content, routeEntry, routeInfo);
}

/**
 * Add route to existing routes file
 */
export function addRouteToFile(filePath: string, routeInfo: RouteInfo, config: CLIConfig): boolean {
  try {
    const { content, imports } = parseExistingRoutes(filePath);
    
    // Generate import statement with valid component name
    const componentName = convertToValidComponentName(routeInfo.pageName);
    let importStatement: string;
    
    // For dynamic routes, use import aliasing to handle special characters in path
    if (routeInfo.pageName.startsWith('_[') && routeInfo.pageName.endsWith(']')) {
      // Use a more descriptive alias that TypeScript can handle
      importStatement = `import ${componentName} from '${routeInfo.importPath}';`;
    } else {
      importStatement = `import ${componentName} from '${routeInfo.importPath}';`;
    }
    
    // Generate route entry
    const routeEntry = generateRouteEntry(routeInfo, componentName);
    
    // Check if import already exists
    if (!content.includes(importStatement)) {
      // Add import after existing imports but before the router creation
      const appImportPattern = /import App from ['"][^'"]*App['"];/;
      const appImportMatch = content.match(appImportPattern);
      
      if (!appImportMatch) {
        console.log(chalk.yellow('⚠️ Could not find App import. Please add route manually.'));
        return false;
      }
      
      const appImportIndex = content.indexOf(appImportMatch[0]);
      const insertIndex = appImportIndex + appImportMatch[0].length;
      const newContent = content.slice(0, insertIndex) + '\n' + importStatement + content.slice(insertIndex);
      
      // Add route - use nested logic for nested routes
      const updatedContent = routeInfo.isNested 
        ? addNestedRouteToParent(newContent, routeEntry, routeInfo)
        : addRouteToChildren(newContent, routeEntry, routeInfo);
      
      fs.writeFileSync(filePath, updatedContent);
      return true;
    } else {
      console.log(chalk.yellow(`⚠️ Route for ${componentName} already exists`));
      return false;
    }
  } catch (error) {
    console.error(chalk.red('❌ Error updating routes file:'), error);
    return false;
  }
}

/**
 * Generate route entry object as string
 */
function generateRouteEntry(routeInfo: RouteInfo, componentName: string): string {
  const isIndex = routeInfo.routePath === '/' || routeInfo.pageName.toLowerCase() === 'index';
  
  if (isIndex) {
    return `        {\n          index: true,\n          element: <${componentName} />,\n        }`;
  } else {
    // For nested routes, use relative path from parent
    let routePath = routeInfo.routePath;
    if (routeInfo.isNested && routeInfo.parentRoute) {
      // Convert absolute route to relative: /mohab/dashboard -> dashboard
      routePath = routeInfo.routePath.replace(routeInfo.parentRoute + '/', '');
    }
    
    return `        {\n          path: '${routePath}',\n          element: <${componentName} />,\n        }`;
  }
}

/**
 * Add route entry to children array in routes file
 */
function addRouteToChildren(content: string, routeEntry: string, routeInfo: RouteInfo): string {
  // Find the children array
  const childrenRegex = /children:\s*\[([\s\S]*?)\]/;
  const match = childrenRegex.exec(content);
  
  if (!match) {
    console.log(chalk.yellow('⚠️ Could not find children array in routes file'));
    return content;
  }
  
  const childrenContent = match[1];
  const commentRegex = /\/\/.*Routes will be automatically added here.*/;
  
  if (commentRegex.test(childrenContent)) {
    // Replace comment with route entry
    return content.replace(commentRegex, routeEntry + ',\n      // Routes will be automatically added here');
  } else {
    // Add to end of children array
    const cleanChildren = childrenContent.trim();
    const hasExistingRoutes = cleanChildren && !cleanChildren.startsWith('//');
    const separator = hasExistingRoutes ? ',' : '';
    
    return content.replace(
      /children:\s*\[([\s\S]*?)\]/,
      `children: [${cleanChildren}${separator}\n${routeEntry},\n    ]`
    );
  }
}

/**
 * Smart route insertion that handles nested routes
 */
function insertRouteIntelligently(content: string, routeEntry: string, routeInfo: RouteInfo): string {
  if (!routeInfo.isNested) {
    // Simple case: add to main children array
    return addRouteToChildren(content, routeEntry, routeInfo);
  }

  // For nested routes, we need to find or create the parent route structure
  // This is a simplified approach - for production, you might want more sophisticated AST parsing
  
  // First, check if we can find an existing parent route structure
  const parentPath = routeInfo.parentRoute;
  if (parentPath) {
    const parentRoutePattern = new RegExp(`path:\\s*['"]${parentPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`);
    
    if (parentRoutePattern.test(content)) {
      // Parent route exists, try to add to its children
      console.log(chalk.blue(`📁 Adding to existing parent route: ${parentPath}`));
      // For now, fall back to adding to main children - in production you'd parse the nested structure
      return addRouteToChildren(content, routeEntry, routeInfo);
    }
  }

  // If parent doesn't exist, add to main children array with a comment
  const commentedEntry = `      // Nested route for ${routeInfo.parentRoute || 'feature'}\n${routeEntry}`;
  return addRouteToChildren(content, commentedEntry, routeInfo);
}

/**
 * Handle nested route creation
 */
export function handleNestedRoute(routeInfo: RouteInfo, config: CLIConfig): void {
  if (!routeInfo.isNested || !routeInfo.parentRoute) {
    return;
  }

  // For nested routes, we might need to ensure parent route exists
  // This is a simplified approach - in production, you'd want more sophisticated logic
  console.log(chalk.blue(`📁 Creating nested route: ${routeInfo.routePath}`));
  console.log(chalk.dim(`   Parent: ${routeInfo.parentRoute}`));
}

/**
 * Main function to handle route generation for a page
 */
export async function generateRouteForPage(
  pageName: string,
  targetDir: string,
  config: CLIConfig
): Promise<boolean> {
  // Only generate routes for React projects (not Next.js)
  if (config.projectType !== 'react') {
    console.log(chalk.dim('ℹ️  Route generation skipped (Next.js uses file-based routing)'));
    return false;
  }

  const routeInfo = parsePagePathToRoute(pageName, targetDir, config);
  
  console.log(chalk.blue(`🛣️  Generating route: ${routeInfo.routePath}`));
  console.log(chalk.dim(`🔍 Debug - Parent route: ${routeInfo.parentRoute}`));
  console.log(chalk.dim(`🔍 Debug - Is nested: ${routeInfo.isNested}`));
  console.log(chalk.dim(`🔍 Debug - Import path: ${routeInfo.importPath}`));
  console.log(chalk.dim(`🔍 Debug - Routes file path: ${getRoutesFilePath(config)}`));
  
  if (routeInfo.isNested) {
    console.log(chalk.dim(`   Creating nested route in feature: ${routeInfo.parentRoute}`));
  }
  
  if (routeInfo.isDynamic) {
    const params = routeInfo.routePath.match(/:(\w+)/g);
    console.log(chalk.dim(`   Dynamic route with parameters: ${params?.join(', ')}`));
  }
  
  // Check if routes file exists, create if not
  const routesPath = getRoutesFilePath(config);
  
  if (!fs.existsSync(routesPath)) {
    console.log(chalk.yellow('📄 Routes file not found. Creating initial routes configuration...'));
    createInitialRoutesFile(config);
    console.log(chalk.green(`✅ Created routes file: ${routesPath}`));
  }

  // Add route to file
  const success = addRouteToFile(routesPath, routeInfo, config);
  
  if (success) {
    console.log(chalk.green(`✅ Added route: ${routeInfo.routePath}`));
    
    if (routeInfo.isNested) {
      console.log(chalk.blue(`   📁 Nested under: ${routeInfo.parentRoute}`));
      console.log(chalk.dim(`   💡 Make sure the parent route component has an <Outlet /> for nested routing`));
    }
    
    if (routeInfo.isDynamic) {
      console.log(chalk.blue(`   🔗 Access parameters with: useParams()`));
    }
    
    // Provide usage hint
    console.log(chalk.dim(`   📝 Import path: ${routeInfo.importPath}`));
  }

  return success;
}
