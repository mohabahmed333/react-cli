"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGlobal = handleGlobal;
const chalk_1 = __importDefault(require("chalk"));
const config_1 = require("../utils/config");
const prompt_1 = require("../utils/prompt");
const file_1 = require("../utils/file");
function handleGlobal(program, rl) {
    program
        .command('global')
        .description('Create multiple global resources')
        .option('-i, --interactive', 'Use interactive mode')
        .action(async (options) => {
        const config = await (0, config_1.setupConfiguration)(rl);
        if (options.interactive) {
            console.log(chalk_1.default.cyan.bold('\n✨ Creating global resources interactively ✨'));
            while (true) {
                const resourceType = await (0, prompt_1.askQuestion)(rl, chalk_1.default.blue('Create (h)ook, (u)til, (t)ype, or (q)uit? '));
                if (resourceType === 'q')
                    break;
                switch (resourceType) {
                    case 'h': {
                        const hookName = await (0, prompt_1.askQuestion)(rl, chalk_1.default.blue('Hook name: '));
                        const ext = config.typescript ? 'ts' : 'js';
                        const content = config.typescript
                            ? `import { useState } from 'react';\n\nexport const use${hookName} = (): [boolean, () => void] => {\n  const [state, setState] = useState(false);\n  const toggle = () => setState(!state);\n  return [state, toggle];\n};\n`
                            : `import { useState } from 'react';\n\nexport const use${hookName} = () => {\n  const [state, setState] = useState(false);\n  const toggle = () => setState(!state);\n  return [state, toggle];\n};\n`;
                        (0, file_1.createFile)(`${config.baseDir}/hooks/use${hookName}.${ext}`, content);
                        break;
                    }
                    case 'u': {
                        const utilName = await (0, prompt_1.askQuestion)(rl, chalk_1.default.blue('Utility name: '));
                        const ext = config.typescript ? 'ts' : 'js';
                        const content = config.typescript
                            ? `export const ${utilName} = (input: string): string => {\n  return input.toUpperCase();\n};\n`
                            : `export const ${utilName} = (input) => {\n  return input.toUpperCase();\n};\n`;
                        (0, file_1.createFile)(`${config.baseDir}/utils/${utilName}.${ext}`, content);
                        break;
                    }
                    case 't': {
                        if (config.typescript) {
                            const typeName = await (0, prompt_1.askQuestion)(rl, chalk_1.default.blue('Type name: '));
                            const content = `export interface ${typeName} {\n  // Add properties here\n}\n\nexport type ${typeName}Type = {\n  id: string;\n  name: string;\n};\n`;
                            (0, file_1.createFile)(`${config.baseDir}/types/${typeName}.types.ts`, content);
                        }
                        else {
                            console.log(chalk_1.default.red('TypeScript must be enabled for types'));
                        }
                        break;
                    }
                    default:
                        console.log(chalk_1.default.red('Invalid option'));
                }
            }
        }
        else {
            console.log(chalk_1.default.red('Specify resource type or use --interactive'));
        }
        rl.close();
    });
}
