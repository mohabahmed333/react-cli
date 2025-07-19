"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePage = handlePage;
const chalk_1 = __importDefault(require("chalk"));
const config_1 = require("../utils/config");
const prompt_1 = require("../utils/prompt");
const file_1 = require("../utils/file");
function createPage(name, options, config) {
    const ext = config.typescript ? 'tsx' : 'jsx';
    const basePath = config.projectType === 'next'
        ? `${config.baseDir}/pages/${config.localization ? '[lang]/' : ''}${name}`
        : `${config.baseDir}/pages/${name}`;
    if (options.hooks) {
        const hookContent = config.typescript
            ? `import { useState } from 'react';\n\nexport const use${name} = (): [boolean, () => void] => {\n  const [state, setState] = useState(false);\n  const toggle = () => setState(!state);\n  return [state, toggle];\n};\n`
            : `import { useState } from 'react';\n\nexport const use${name} = () => {\n  const [state, setState] = useState(false);\n  const toggle = () => setState(!state);\n  return [state, toggle];\n};\n`;
        (0, file_1.createFile)(`${config.baseDir}/hooks/use${name}.${config.typescript ? 'ts' : 'js'}`, hookContent);
    }
    if (options.utils) {
        const utilContent = config.typescript
            ? `export const format${name} = (input: string): string => {\n  return input.toUpperCase();\n};\n`
            : `export const format${name} = (input) => {\n  return input.toUpperCase();\n};\n`;
        (0, file_1.createFile)(`${config.baseDir}/utils/${name}Utils.${config.typescript ? 'ts' : 'js'}`, utilContent);
    }
    if (options.types && config.typescript) {
        const typeContent = `export interface ${name}Props {\n  // Add props here\n}\n\nexport type ${name}Type = {\n  id: string;\n  name: string;\n};\n`;
        (0, file_1.createFile)(`${config.baseDir}/types/${name}.types.ts`, typeContent);
    }
    (0, file_1.createFolder)(basePath);
    const pageContent = config.typescript
        ? `import React from 'react';\n${options.css ? `import styles from './${name}.module.css';\n` : ''}\ninterface ${name}Props {}\n\nconst ${name}: React.FC<${name}Props> = () => {\n  return (\n    <div${options.css ? ' className={styles.container}' : ''}>\n      <h1>${name} Page</h1>\n    </div>\n  );\n};\n\nexport default ${name};\n`
        : `import React from 'react';\n${options.css ? `import styles from './${name}.module.css';\n` : ''}\nconst ${name} = () => {\n  return (\n    <div${options.css ? ' className={styles.container}' : ''}>\n      <h1>${name} Page</h1>\n    </div>\n  );\n};\n\nexport default ${name};\n`;
    (0, file_1.createFile)(`${basePath}/${name}.${ext}`, pageContent);
    if (options.css) {
        (0, file_1.createFile)(`${basePath}/${name}.module.css`, `.container {\n  padding: 20px;\n}\n`);
    }
    if (options.test) {
        const testContent = config.typescript
            ? `import { render, screen } from '@testing-library/react';\nimport ${name} from './${name}';\n\ndescribe('${name}', () => {\n  it('renders', () => {\n    render(<${name} />);\n    expect(screen.getByText('${name} Page')).toBeInTheDocument();\n  });\n});\n`
            : `import { render, screen } from '@testing-library/react';\nimport ${name} from './${name}';\n\ntest('renders ${name}', () => {\n  render(<${name} />);\n  expect(screen.getByText('${name} Page')).toBeInTheDocument();\n});\n`;
        (0, file_1.createFile)(`${basePath}/${name}.test.${ext}`, testContent);
    }
    if (options.components) {
        (0, file_1.createFolder)(`${basePath}/components`);
    }
    if (options.lib) {
        (0, file_1.createFolder)(`${basePath}/lib`);
        (0, file_1.createFile)(`${basePath}/lib/constants.${config.typescript ? 'ts' : 'js'}`, config.typescript
            ? `export const ${name.toUpperCase()}_CONSTANT: string = 'value';\n`
            : `export const ${name.toUpperCase()}_CONSTANT = 'value';\n`);
    }
    if (options.layout && config.projectType === 'next') {
        const layoutContent = config.typescript
            ? `import { ReactNode } from 'react';\n\nexport default function Layout({ children }: { children: ReactNode }) {\n  return (\n    <div>\n      <main>{children}</main>\n    </div>\n  );\n}\n`
            : `export default function Layout({ children }) {\n  return (\n    <div>\n      <main>{children}</main>\n    </div>\n  );\n}\n`;
        (0, file_1.createFile)(`${basePath}/layout.${ext}`, layoutContent);
    }
    console.log(chalk_1.default.green.bold(`\n🎉 Created ${name} page at ${basePath}`));
}
function handlePage(program, rl) {
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
        const config = await (0, config_1.setupConfiguration)(rl);
        const finalConfig = {
            ...config,
            typescript: options.ts ?? config.typescript,
            projectType: options.next ? 'next' : config.projectType,
            localization: options.intl ?? config.localization
        };
        if (options.interactive) {
            console.log(chalk_1.default.cyan.bold(`\n✨ Creating ${name} page interactively ✨`));
            const pageOptions = {
                css: (await (0, prompt_1.askQuestion)(rl, chalk_1.default.blue('Include CSS module? (y/n): '))) === 'y',
                test: (await (0, prompt_1.askQuestion)(rl, chalk_1.default.blue('Include test file? (y/n): '))) === 'y',
                components: (await (0, prompt_1.askQuestion)(rl, chalk_1.default.blue('Create components folder? (y/n): '))) === 'y',
                lib: (await (0, prompt_1.askQuestion)(rl, chalk_1.default.blue('Include lib utilities? (y/n): '))) === 'y',
                hooks: (await (0, prompt_1.askQuestion)(rl, chalk_1.default.blue('Create global hooks? (y/n): '))) === 'y',
                utils: (await (0, prompt_1.askQuestion)(rl, chalk_1.default.blue('Create global utils? (y/n): '))) === 'y',
                types: finalConfig.typescript && (await (0, prompt_1.askQuestion)(rl, chalk_1.default.blue('Create global types? (y/n): '))) === 'y',
                layout: finalConfig.projectType === 'next' && (await (0, prompt_1.askQuestion)(rl, chalk_1.default.blue('Create layout file? (y/n): '))) === 'y'
            };
            createPage(name, pageOptions, finalConfig);
        }
        else {
            createPage(name, options, finalConfig);
        }
        rl.close();
    });
}
