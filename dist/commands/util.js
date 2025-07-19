"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUtil = handleUtil;
const chalk_1 = __importDefault(require("chalk"));
const config_1 = require("../utils/config");
const prompt_1 = require("../utils/prompt");
const file_1 = require("../utils/file");
function handleUtil(program, rl) {
    program
        .command('util <name>')
        .description('Create a utility function')
        .option('--ts', 'Override TypeScript setting')
        .option('-i, --interactive', 'Use interactive mode')
        .option('--replace', 'Replace file if it exists')
        .action(async (name, options) => {
        const config = await (0, config_1.setupConfiguration)(rl);
        const useTS = options.ts ?? config.typescript;
        const utilName = options.interactive
            ? (await (0, prompt_1.askQuestion)(rl, chalk_1.default.blue('Enter utility name: '))) || name
            : name;
        const ext = useTS ? 'ts' : 'js';
        const content = useTS
            ? `export const ${utilName} = (input: string): string => {\n  return input.toUpperCase();\n};\n`
            : `export const ${utilName} = (input) => {\n  return input.toUpperCase();\n};\n`;
        const filePath = `${config.baseDir}/utils/${utilName}.${ext}`;
        if ((0, file_1.createFile)(filePath, content, options.replace)) {
            console.log(chalk_1.default.green(`✅ Created util: ${filePath}`));
        }
        else {
            console.log(chalk_1.default.yellow(`⚠️ Util exists: ${filePath} (use --replace to overwrite)`));
        }
        rl.close();
    });
}
