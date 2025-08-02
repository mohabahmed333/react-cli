#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { Command } = require('commander');
const chalk = require('chalk');
const readline = require('readline');

const program = new Command();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Default configura// Config commands
program
  .command('init')
    .action(() => {
    console.log(chalk.cyan.bold('\n📘 CLI Documentation'));
    console.log('\nCommands:');
    console.log('  hook <n>       Create a custom hook');
    console.log('  util <n>       Create a utility function');
    console.log('  type <n>       Create TypeScript types');
    console.log('  global            Create multiple global resources');
    console.log('  page <n>       Create a page with components');
    console.log('  audit <path>   Run performance audit on a page');
    console.log('  init              Initialize project config');
    console.log('  config            Show current config');
    console.log('\nPerformance Options:');
    console.log('  --perf-hook       Add performance monitoring hook');
    console.log('  --perf-monitoring Add performance monitoring wrapper');
    console.log('  --audit-on-build  Setup performance audit scripts');
    console.log('\nAudit Options:');
    console.log('  --url <url>       URL of running application');
    console.log('  --save-baseline   Save results as baseline');
    console.log('  --compare-only    Only compare with baseline');
    console.log('  --threshold <n>   Performance threshold (default: 90)');
    console.log('\nOptions:');
    console.log('  --ts              Override TypeScript setting');
    console.log('  --interactive     Use interactive mode');
    console.log('\nExamples:');
    console.log('  create-page hook useAuth --ts');
    console.log('  create-page page Dashboard --css --test --perf-hook');
    console.log('  create-page page Dashboard --interactive');
    console.log('  create-page audit src/pages/Dashboard --save-baseline');
    console.log('  create-page global --interactive');
    rl.close();
  });

// Performance audit command
program
  .command('audit <path>')
  .description('Run performance audit on a page component')
  .option('--url <url>', 'URL of the running application')
  .option('--save-baseline', 'Save results as performance baseline')
  .option('--compare-only', 'Only compare with existing baseline')
  .option('--threshold <number>', 'Performance threshold (default: 90)', '90')
  .action(async (pagePath, options) => {
    try {
      console.log(chalk.cyan('🚀 Performance audit feature'));
      console.log(chalk.yellow('Note: This feature requires TypeScript build. Please use: npm run build && node dist/cli.js audit <path>'));
      console.log(chalk.blue('Or install required dependencies: npm install --save-dev lighthouse chrome-launcher'));
    } catch (error) {
      console.error('Failed to run performance audit:', error);
    } finally {
      rl.close();
    }
  });

program
  .command('config')
  .description('Show current config')
  .action(async () => {
    const config = await setupConfiguration();
    console.log(chalk.cyan('\nCurrent Config:'));
    console.log(JSON.stringify(config, null, 2));
    rl.close();
  });

// Help command  
program
  .command('help')
  .description('Show help')
  .action(() => {
    console.log(chalk.cyan.bold('\n📘 CLI Documentation'));
    console.log('\nCommands:');
    console.log('  hook <n>       Create a custom hook');
    console.log('  util <n>       Create a utility function');
    console.log('  type <n>       Create TypeScript types');
    console.log('  global            Create multiple global resources');
    console.log('  page <n>       Create a page with components');
    console.log('  audit <path>   Run performance audit on a page');
    console.log('  init              Initialize project config');
    console.log('  config            Show current config');
    console.log('\nPerformance Options:');
    console.log('  --perf-hook       Add performance monitoring hook');
    console.log('  --perf-monitoring Add performance monitoring wrapper');
    console.log('  --audit-on-build  Setup performance audit scripts');
    console.log('\nAudit Options:');
    console.log('  --url <url>       URL of running application');
    console.log('  --save-baseline   Save results as baseline');
    console.log('  --compare-only    Only compare with baseline');
    console.log('  --threshold <n>   Performance threshold (default: 90)');
    console.log('\nOptions:');
    console.log('  --ts              Override TypeScript setting');
    console.log('  --interactive     Use interactive mode');
    console.log('\nExamples:');
    console.log('  create-page hook useAuth --ts');
    console.log('  create-page page Dashboard --css --test --perf-hook');
    console.log('  create-page page Dashboard --interactive');
    console.log('  create-page audit src/pages/Dashboard --save-baseline');
    console.log('  create-page global --interactive');
    rl.close();
  });

program.parseAsync(process.argv).catch((err) => {
  console.error(chalk.red('Error:'), err);
  rl.close();
  process.exit(1);
});

// Default configuration
const defaultConfig = {
  baseDir: 'src',
  projectType: 'react',
  typescript: false,
  localization: false
};

// Utility functions
function createFolder(folderPath) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}

function createFile(filePath, content = '') {
  const dir = path.dirname(filePath);
  createFolder(dir);
  
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function setupConfiguration() {
  const configPath = path.join(process.cwd(), 'create.config.json');
  try {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (e) {
    console.error(chalk.red('Error reading config:'), e);
  }

  console.log(chalk.yellow('\n⚙️ First-time setup'));
  const config = { ...defaultConfig };

  config.baseDir = await askQuestion(
    chalk.blue('Project base directory (src/app): ')) || 'src';
  
  config.projectType = await askQuestion(
    chalk.blue('Project type (react/next): ')) || 'react';
  
  config.typescript = (await askQuestion(
    chalk.blue('Use TypeScript? (y/n): '))) === 'y';

  if (config.projectType === 'next') {
    config.localization = (await askQuestion(
      chalk.blue('Use [lang] localization? (y/n): '))) === 'y';
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(chalk.green('✅ Configuration saved'));
  return config;
}

// Resource creators
async function createHook(name, useTS, config) {
  const ext = useTS ? 'ts' : 'js';
  const content = useTS
    ? `import { useState } from 'react';\n\nexport const use${name} = (): [boolean, () => void] => {\n  const [state, setState] = useState(false);\n  const toggle = () => setState(!state);\n  return [state, toggle];\n};\n`
    : `import { useState } from 'react';\n\nexport const use${name} = () => {\n  const [state, setState] = useState(false);\n  const toggle = () => setState(!state);\n  return [state, toggle];\n};\n`;
  
  const filePath = path.join(config.baseDir, 'hooks', `use${name}.${ext}`);
  if (createFile(filePath, content)) {
    console.log(chalk.green(`✅ Created hook: ${filePath}`));
  } else {
    console.log(chalk.yellow(`⚠️ Hook exists: ${filePath}`));
  }
}

async function createUtil(name, useTS, config) {
  const ext = useTS ? 'ts' : 'js';
  const content = useTS
    ? `export const ${name} = (input: string): string => {\n  return input.toUpperCase();\n};\n`
    : `export const ${name} = (input) => {\n  return input.toUpperCase();\n};\n`;
  
  const filePath = path.join(config.baseDir, 'utils', `${name}.${ext}`);
  if (createFile(filePath, content)) {
    console.log(chalk.green(`✅ Created util: ${filePath}`));
  } else {
    console.log(chalk.yellow(`⚠️ Util exists: ${filePath}`));
  }
}

async function createType(name, useTS, config) {
  if (!useTS) {
    console.log(chalk.red('TypeScript must be enabled in config'));
    return;
  }
  
  const content = `export interface ${name} {\n  // Add properties here\n}\n\nexport type ${name}Type = {\n  id: string;\n  name: string;\n};\n`;
  const filePath = path.join(config.baseDir, 'types', `${name}.types.ts`);
  if (createFile(filePath, content)) {
    console.log(chalk.green(`✅ Created type: ${filePath}`));
  } else {
    console.log(chalk.yellow(`⚠️ Type exists: ${filePath}`));
  }
}

// Individual resource commands with interactive options
program
  .command('hook <name>')
  .description('Create a custom hook')
  .option('--ts', 'Override TypeScript setting')
  .option('-i, --interactive', 'Use interactive mode')
  .action(async (name, options) => {
    const config = await setupConfiguration();
    const useTS = options.ts ?? config.typescript;
    
    if (options.interactive) {
      const hookName = await askQuestion(chalk.blue('Enter hook name: ')) || name;
      await createHook(hookName, useTS, config);
    } else {
      await createHook(name, useTS, config);
    }
    rl.close();
  });

program
  .command('util <name>')
  .description('Create a utility function')
  .option('--ts', 'Override TypeScript setting')
  .option('-i, --interactive', 'Use interactive mode')
  .action(async (name, options) => {
    const config = await setupConfiguration();
    const useTS = options.ts ?? config.typescript;
    
    if (options.interactive) {
      const utilName = await askQuestion(chalk.blue('Enter utility name: ')) || name;
      await createUtil(utilName, useTS, config);
    } else {
      await createUtil(name, useTS, config);
    }
    rl.close();
  });

program
  .command('type <name>')
  .description('Create TypeScript types')
  .option('--ts', 'Override TypeScript setting')
  .option('-i, --interactive', 'Use interactive mode')
  .action(async (name, options) => {
    const config = await setupConfiguration();
    const useTS = options.ts ?? config.typescript;
    
    if (options.interactive) {
      const typeName = await askQuestion(chalk.blue('Enter type name: ')) || name;
      await createType(typeName, useTS, config);
    } else {
      await createType(name, useTS, config);
    }
    rl.close();
  });

// Global command with interactive mode
program
  .command('global')
  .description('Create multiple global resources')
  .option('-i, --interactive', 'Use interactive mode')
  .action(async (options) => {
    const config = await setupConfiguration();
    
    if (options.interactive) {
      console.log(chalk.cyan.bold('\n✨ Creating global resources interactively ✨'));
      
      while (true) {
        const resourceType = await askQuestion(
          chalk.blue('Create (h)ook, (u)til, (t)ype, or (q)uit? ')
        );
        
        if (resourceType === 'q') break;
        
        switch (resourceType) {
          case 'h':
            const hookName = await askQuestion(chalk.blue('Hook name: '));
            await createHook(hookName, config.typescript, config);
            break;
          case 'u':
            const utilName = await askQuestion(chalk.blue('Utility name: '));
            await createUtil(utilName, config.typescript, config);
            break;
          case 't':
            if (config.typescript) {
              const typeName = await askQuestion(chalk.blue('Type name: '));
              await createType(typeName, true, config);
            } else {
              console.log(chalk.red('TypeScript must be enabled for types'));
            }
            break;
          default:
            console.log(chalk.red('Invalid option'));
        }
      }
    } else {
      console.log(chalk.red('Specify resource type or use --interactive'));
    }
    rl.close();
  });

// Page creation with all options
program
  .command('page <name>')
  .description('Create a page with components')
  .option('--ts', 'Override TypeScript setting')
  .option('--next', 'Override project type as Next.js')
  .option('--intl', 'Override internationalization setting')
  .option('--css', 'Include CSS module')
  .option('--test', 'Include test file')
  .option('--components', 'Include components folder')
  .option('--lib', 'Include lib utilities')
  .option('--hooks', 'Include custom hooks')
  .option('--utils', 'Include utility functions')
  .option('--types', 'Include TypeScript types')
  .option('--layout', 'Include layout file')
  .option('-i, --interactive', 'Use interactive mode')
  .action(async (name, options) => {
    const config = await setupConfiguration();
    const finalConfig = {
      ...config,
      typescript: options.ts ?? config.typescript,
      projectType: options.next ? 'next' : config.projectType,
      localization: options.intl ?? config.localization
    };
    
    if (options.interactive) {
      console.log(chalk.cyan.bold(`\n✨ Creating ${name} page interactively ✨`));
      
      const pageOptions = {
        css: (await askQuestion(chalk.blue('Include CSS module? (y/n): '))) === 'y',
        test: (await askQuestion(chalk.blue('Include test file? (y/n): '))) === 'y',
        components: (await askQuestion(chalk.blue('Create components folder? (y/n): '))) === 'y',
        lib: (await askQuestion(chalk.blue('Include lib utilities? (y/n): '))) === 'y',
        hooks: (await askQuestion(chalk.blue('Create global hooks? (y/n): '))) === 'y',
        utils: (await askQuestion(chalk.blue('Create global utils? (y/n): '))) === 'y',
        types: finalConfig.typescript && 
              (await askQuestion(chalk.blue('Create global types? (y/n): '))) === 'y',
        layout: finalConfig.projectType === 'next' && 
               (await askQuestion(chalk.blue('Create layout file? (y/n): '))) === 'y'
      };
      
      createPage(name, pageOptions, finalConfig);
    } else {
      createPage(name, options, finalConfig);
    }
    rl.close();
  });

function createPage(name, options, config) {
  const ext = config.typescript ? 'tsx' : 'jsx';
  const basePath = config.projectType === 'next'
    ? path.join(config.baseDir, 'pages', config.localization ? '[lang]' : '', name)
    : path.join(config.baseDir, 'pages', name);

  // Create global resources first
  if (options.hooks) {
    const hookContent = config.typescript
      ? `import { useState } from 'react';\n\nexport const use${name} = (): [boolean, () => void] => {\n  const [state, setState] = useState(false);\n  const toggle = () => setState(!state);\n  return [state, toggle];\n};\n`
      : `import { useState } from 'react';\n\nexport const use${name} = () => {\n  const [state, setState] = useState(false);\n  const toggle = () => setState(!state);\n  return [state, toggle];\n};\n`;
    
    createFile(path.join(config.baseDir, 'hooks', `use${name}.${config.typescript ? 'ts' : 'js'}`), hookContent);
  }

  if (options.utils) {
    const utilContent = config.typescript
      ? `export const format${name} = (input: string): string => {\n  return input.toUpperCase();\n};\n`
      : `export const format${name} = (input) => {\n  return input.toUpperCase();\n};\n`;
    
    createFile(path.join(config.baseDir, 'utils', `${name}Utils.${config.typescript ? 'ts' : 'js'}`), utilContent);
  }

  if (options.types && config.typescript) {
    const typeContent = `export interface ${name}Props {\n  // Add props here\n}\n\nexport type ${name}Type = {\n  id: string;\n  name: string;\n};\n`;
    createFile(path.join(config.baseDir, 'types', `${name}.types.ts`), typeContent);
  }

  // Create page structure
  createFolder(basePath);

  // Page component
  const pageContent = config.typescript
    ? `import React from 'react';\n${options.css ? `import styles from './${name}.module.css';\n` : ''}\ninterface ${name}Props {}\n\nconst ${name}: React.FC<${name}Props> = () => {\n  return (\n    <div${options.css ? ' className={styles.container}' : ''}>\n      <h1>${name} Page</h1>\n    </div>\n  );\n};\n\nexport default ${name};\n`
    : `import React from 'react';\n${options.css ? `import styles from './${name}.module.css';\n` : ''}\nconst ${name} = () => {\n  return (\n    <div${options.css ? ' className={styles.container}' : ''}>\n      <h1>${name} Page</h1>\n    </div>\n  );\n};\n\nexport default ${name};\n`;

  createFile(path.join(basePath, `${name}.${ext}`), pageContent);

  // Additional files
  if (options.css) {
    createFile(path.join(basePath, `${name}.module.css`), `.container {\n  padding: 20px;\n}\n`);
  }

  if (options.test) {
    const testContent = config.typescript
      ? `import { render, screen } from '@testing-library/react';\nimport ${name} from './${name}';\n\ndescribe('${name}', () => {\n  it('renders', () => {\n    render(<${name} />);\n    expect(screen.getByText('${name} Page')).toBeInTheDocument();\n  });\n});\n`
      : `import { render, screen } from '@testing-library/react';\nimport ${name} from './${name}';\n\ntest('renders ${name}', () => {\n  render(<${name} />);\n  expect(screen.getByText('${name} Page')).toBeInTheDocument();\n});\n`;
    
    createFile(path.join(basePath, `${name}.test.${ext}`), testContent);
  }

  if (options.components) {
    createFolder(path.join(basePath, 'components'));
  }

  if (options.lib) {
    createFolder(path.join(basePath, 'lib'));
    createFile(path.join(basePath, 'lib', `constants.${config.typescript ? 'ts' : 'js'}`), 
      config.typescript
        ? `export const ${name.toUpperCase()}_CONSTANT: string = 'value';\n`
        : `export const ${name.toUpperCase()}_CONSTANT = 'value';\n`);
  }

  if (options.layout && config.projectType === 'next') {
    const layoutContent = config.typescript
      ? `import { ReactNode } from 'react';\n\nexport default function Layout({ children }: { children: ReactNode }) {\n  return (\n    <div>\n      <main>{children}</main>\n    </div>\n  );\n}\n`
      : `export default function Layout({ children }) {\n  return (\n    <div>\n      <main>{children}</main>\n    </div>\n  );\n}\n`;
    
    createFile(path.join(basePath, `layout.${ext}`), layoutContent);
  }

  console.log(chalk.green.bold(`\n🎉 Created ${name} page at ${path.resolve(basePath)}`));
}

// Config commands
program
  .command('config')
  .description('Show current config')
  .action(async () => {
    const config = await setupConfiguration();
    console.log(chalk.cyan('\nCurrent Config:'));
    console.log(JSON.stringify(config, null, 2));
    rl.close();
  });

// Help command
program
  .command('help')
  .description('Show help')
  .action(() => {
    console.log(chalk.cyan.bold('\n📘 CLI Documentation'));
    console.log('\nCommands:');
    console.log('  hook <name>       Create a custom hook');
    console.log('  util <name>       Create a utility function');
    console.log('  type <name>       Create TypeScript types');
    console.log('  global            Create multiple global resources');
    console.log('  page <name>       Create a page with components');
    console.log('  init              Initialize project config');
    console.log('  config            Show current config');
    console.log('\nOptions:');
    console.log('  --ts              Override TypeScript setting');
    console.log('  --interactive     Use interactive mode');
    console.log('\nExamples:');
    console.log('  create-page hook useAuth --ts');
    console.log('  create-page page Dashboard --css --test --interactive');
    console.log('  create-page global --interactive');
    rl.close();
  });

program.parseAsync(process.argv).catch((err) => {
  console.error(chalk.red('Error:'), err);
  rl.close();
  process.exit(1);
});