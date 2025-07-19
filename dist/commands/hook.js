"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleHook = handleHook;
const chalk_1 = __importDefault(require("chalk"));
const config_1 = require("../utils/config");
const prompt_1 = require("../utils/prompt");
const file_1 = require("../utils/file");
function handleHook(program, rl) {
    program
        .command('hook <name>')
        .description('Create a custom hook')
        .option('--ts', 'Override TypeScript setting')
        .option('-i, --interactive', 'Use interactive mode')
        .option('--replace', 'Replace file if it exists')
        .action(async (name, options) => {
        const config = await (0, config_1.setupConfiguration)(rl);
        const useTS = options.ts ?? config.typescript;
        const hookName = options.interactive
            ? (await (0, prompt_1.askQuestion)(rl, chalk_1.default.blue('Enter hook name: '))) || name
            : name;
        const ext = useTS ? 'ts' : 'js';
        const content = useTS
            ? `import { useState } from 'react';\n\nexport const use${hookName} = (): [boolean, () => void] => {\n  const [state, setState] = useState(false);\n  const toggle = () => setState(!state);\n  return [state, toggle];\n};\n`
            : `import { useState } from 'react';\n\nexport const use${hookName} = () => {\n  const [state, setState] = useState(false);\n  const toggle = () => setState(!state);\n  return [state, toggle];\n};\n`;
        const filePath = `${config.baseDir}/hooks/use${hookName}.${ext}`;
        if ((0, file_1.createFile)(filePath, content, options.replace)) {
            console.log(chalk_1.default.green(`✅ Created hook: ${filePath}`));
        }
        else {
            console.log(chalk_1.default.yellow(`⚠️ Hook exists: ${filePath} (use --replace to overwrite)`));
        }
        rl.close();
    });
}
