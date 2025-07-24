import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { askQuestion } from '../../utils/prompt';
import { setupConfiguration } from '../../utils/config';

export function findFoldersByName(baseDir: string, folderName: string): string[] {
  const results: string[] = [];
  function search(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (entry.name.toLowerCase() === folderName.toLowerCase()) {
          results.push(path.join(dir, entry.name));
        }
        search(path.join(dir, entry.name));
      }
    }
  }
  search(baseDir);
  return results;
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function isPascalCase(name: string) {
  return /^[A-Z][a-zA-Z0-9]*$/.test(name);
}

export async function handleNamedType(kind: 'enum' | 'interface' | 'class', name: string | undefined, folder: string | undefined, options: any, rl: any) {
  const config = await setupConfiguration(rl);
  const useTS = config.typescript;
  let typeName = name;
  let targetDir: string | undefined = undefined;
  if (options.interactive) {
    // 1. Prompt for name
    typeName = (await askQuestion(rl, chalk.blue(`Enter ${kind} name (PascalCase): `))) || '';
    if (!isPascalCase(typeName)) {
      console.log(chalk.red(`❌ ${capitalize(kind)} name must be PascalCase and start with a capital letter`));
      rl.close();
      return;
    }
    // 2. Ask if user wants to add to a specific folder
    const useFolder = await askQuestion(rl, chalk.blue(`Add to a specific folder under app/? (y/n): `));
    if (useFolder.toLowerCase() === 'y') {
      // 3. Prompt for folder name
      const folderName = await askQuestion(rl, chalk.blue('Enter folder name: '));
      if (!folderName) {
        console.log(chalk.red('❌ Folder name required.'));
        rl.close();
        return;
      }
      if (folderName.includes('/') || folderName.includes('\\')) {
        targetDir = path.join(config.baseDir, folderName);
      } else {
        const baseSearch = path.join(process.cwd(), 'app');
        const matches = findFoldersByName(baseSearch, folderName);
        if (matches.length === 0) {
          const createNew = await askQuestion(rl, chalk.yellow(`No folder named "${folderName}" found under app/. Create it? (y/n): `));
          if (createNew.toLowerCase() !== 'y') {
            console.log(chalk.yellow(`⏩ ${capitalize(kind)} creation cancelled`));
            rl.close();
            return;
          }
          targetDir = path.join(baseSearch, folderName);
          fs.mkdirSync(targetDir, { recursive: true });
          console.log(chalk.green(`📁 Created directory: ${targetDir}`));
        } else if (matches.length === 1) {
          targetDir = matches[0];
        } else {
          let chosen = matches[0];
          console.log(chalk.yellow('Multiple folders found:'));
          matches.forEach((m, i) => console.log(`${i + 1}: ${m}`));
          const idx = await askQuestion(rl, chalk.blue('Select folder number: '));
          const num = parseInt(idx, 10);
          if (!isNaN(num) && num >= 1 && num <= matches.length) {
            chosen = matches[num - 1];
          } else {
            console.log(chalk.red('Invalid selection. Creation cancelled.'));
            rl.close();
            return;
          }
          targetDir = chosen;
        }
      }
    } else {
      targetDir = path.join(config.baseDir, 'types');
    }
    await createNamedTypeInPath(kind, typeName, targetDir, options.replace);
    rl.close();
    return;
  }
  // Non-interactive mode (legacy)
  if (!typeName) {
    console.log(chalk.red(`❌ ${capitalize(kind)} name is required.`));
    rl.close();
    return;
  }
  if (!isPascalCase(typeName)) {
    console.log(chalk.red(`❌ ${capitalize(kind)} name must be PascalCase and start with a capital letter`));
    rl.close();
    return;
  }
  if (folder) {
    if (folder.includes('/') || folder.includes('\\')) {
      targetDir = path.join(config.baseDir, folder);
    } else {
      const baseSearch = path.join(process.cwd(), 'app');
      const matches = findFoldersByName(baseSearch, folder);
      if (matches.length === 0) {
        console.log(chalk.red(`❌ No folder named "${folder}" found under app/. Use -i to create interactively.`));
        rl.close();
        return;
      } else if (matches.length === 1) {
        targetDir = matches[0];
      } else {
        targetDir = matches[0]; // Default to first match
      }
    }
    await createNamedTypeInPath(kind, typeName, targetDir, options.replace);
  } else {
    targetDir = path.join(config.baseDir, 'types');
    await createNamedTypeInPath(kind, typeName, targetDir, options.replace);
  }
  rl.close();
}

export async function createNamedTypeInPath(kind: 'enum' | 'interface' | 'class', typeName: string, fullPath: string, replace = false) {
  try {
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(chalk.green(`📁 Created directory: ${fullPath}`));
    }
    let filePath = path.join(fullPath, `${typeName}.${kind}.ts`);
    if (fs.existsSync(filePath) && !replace) {
      console.log(chalk.yellow(`⚠️ ${capitalize(kind)} file already exists: ${filePath}`));
      return;
    }
    let content = '';
    if (kind === 'enum') {
      content = `export enum ${typeName} {\n  // Add enum members here\n  Example = 'EXAMPLE'\n}\n`;
    } else if (kind === 'interface') {
      content = `export interface ${typeName} {\n  // Add properties here\n}\n`;
    } else if (kind === 'class') {
      content = `export class ${typeName} {\n  // Add properties and methods here\n  constructor() {\n    // ...\n  }\n}\n`;
    }
    fs.writeFileSync(filePath, content);
    console.log(chalk.green(`✅ Created ${capitalize(kind)}: ${filePath}`));
  } catch (error: any) {
    console.log(chalk.red(`❌ Error creating ${kind}:`));
    console.error(chalk.red(error.message));
    if (error.code === 'ENOENT') {
      console.log(chalk.yellow('💡 Check that parent directories exist and are writable'));
    } else if (error.code === 'EACCES') {
      console.log(chalk.yellow('💡 You might need permission to write to this directory'));
    }
  }
}

export async function handleTypeLegacy(name: string | undefined, folder: string | undefined, options: any, rl: any) {
  const config = await setupConfiguration(rl);
  const useTS = config.typescript;
  let typeName = name;
  let targetDir: string | undefined = undefined;
  if (options.interactive) {
    typeName = (await askQuestion(rl, chalk.blue('Enter type name (PascalCase): '))) || '';
    if (!/^[A-Z][a-zA-Z0-9]*$/.test(typeName)) {
      console.log(chalk.red('❌ Type name must be PascalCase and start with a capital letter'));
      rl.close();
      return;
    }
    const useFolder = await askQuestion(rl, chalk.blue('Add to a specific folder under app/? (y/n): '));
    if (useFolder.toLowerCase() === 'y') {
      const folderName = await askQuestion(rl, chalk.blue('Enter folder name: '));
      if (!folderName) {
        console.log(chalk.red('❌ Folder name required.'));
        rl.close();
        return;
      }
      if (folderName.includes('/') || folderName.includes('\\')) {
        targetDir = path.join(config.baseDir, folderName);
      } else {
        const baseSearch = path.join(process.cwd(), 'app');
        const matches = findFoldersByName(baseSearch, folderName);
        if (matches.length === 0) {
          const createNew = await askQuestion(rl, chalk.yellow(`No folder named "${folderName}" found under app/. Create it? (y/n): `));
          if (createNew.toLowerCase() !== 'y') {
            console.log(chalk.yellow('⏩ Type creation cancelled'));
            rl.close();
            return;
          }
          targetDir = path.join(baseSearch, folderName);
          fs.mkdirSync(targetDir, { recursive: true });
          console.log(chalk.green(`📁 Created directory: ${targetDir}`));
        } else if (matches.length === 1) {
          targetDir = matches[0];
        } else {
          let chosen = matches[0];
          console.log(chalk.yellow('Multiple folders found:'));
          matches.forEach((m, i) => console.log(`${i + 1}: ${m}`));
          const idx = await askQuestion(rl, chalk.blue('Select folder number: '));
          const num = parseInt(idx, 10);
          if (!isNaN(num) && num >= 1 && num <= matches.length) {
            chosen = matches[num - 1];
          } else {
            console.log(chalk.red('Invalid selection. Type creation cancelled.'));
            rl.close();
            return;
          }
          targetDir = chosen;
        }
      }
    } else {
      targetDir = path.join(config.baseDir, 'types');
    }
    await createTypeLegacyInPath(typeName, targetDir, options.replace);
    rl.close();
    return;
  }
  // Non-interactive mode (legacy)
  if (!typeName) {
    console.log(chalk.red('❌ Type name is required.'));
    rl.close();
    return;
  }
  if (!/^[A-Z][a-zA-Z0-9]*$/.test(typeName)) {
    console.log(chalk.red('❌ Type name must be PascalCase and start with a capital letter'));
    rl.close();
    return;
  }
  if (folder) {
    if (folder.includes('/') || folder.includes('\\')) {
      targetDir = path.join(config.baseDir, folder);
    } else {
      const baseSearch = path.join(process.cwd(), 'app');
      const matches = findFoldersByName(baseSearch, folder);
      if (matches.length === 0) {
        console.log(chalk.red(`❌ No folder named "${folder}" found under app/. Use -i to create interactively.`));
        rl.close();
        return;
      } else if (matches.length === 1) {
        targetDir = matches[0];
      } else {
        targetDir = matches[0]; // Default to first match
      }
    }
    await createTypeLegacyInPath(typeName, targetDir, options.replace);
  } else {
    targetDir = path.join(config.baseDir, 'types');
    await createTypeLegacyInPath(typeName, targetDir, options.replace);
  }
  rl.close();
}

export async function createTypeLegacyInPath(typeName: string, fullPath: string, replace = false) {
  try {
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(chalk.green(`📁 Created directory: ${fullPath}`));
    }
    const typeFilePath = path.join(fullPath, `${typeName}.types.ts`);
    if (fs.existsSync(typeFilePath) && !replace) {
      console.log(chalk.yellow(`⚠️ Type file already exists: ${typeFilePath}`));
      return;
    }
    const content = `export interface ${typeName} {\n  // Add properties here\n}\n\nexport type ${typeName}Type = {\n  id: string;\n  name: string;\n};\n`;
    fs.writeFileSync(typeFilePath, content);
    console.log(chalk.green(`✅ Created type: ${typeFilePath}`));
  } catch (error: any) {
    console.log(chalk.red('❌ Error creating type:'));
    console.error(chalk.red(error.message));
    if (error.code === 'ENOENT') {
      console.log(chalk.yellow('💡 Check that parent directories exist and are writable'));
    } else if (error.code === 'EACCES') {
      console.log(chalk.yellow('💡 You might need permission to write to this directory'));
    }
  }
} 