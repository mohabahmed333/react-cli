"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleType = handleType;
const chalk_1 = __importDefault(require("chalk"));
const config_1 = require("../utils/config");
const prompt_1 = require("../utils/prompt");
const file_1 = require("../utils/file");
function handleType(program, rl) {
    program
        .command('type <name>')
        .description('Create TypeScript types')
        .option('--ts', 'Override TypeScript setting')
        .option('-i, --interactive', 'Use interactive mode')
        .option('--replace', 'Replace file if it exists')
        .action(async (name, options) => {
        const config = await (0, config_1.setupConfiguration)(rl);
        const useTS = options.ts ?? config.typescript;
        if (!useTS) {
            console.log(chalk_1.default.red('TypeScript must be enabled in config'));
            rl.close();
            return;
        }
        const typeName = options.interactive
            ? (await (0, prompt_1.askQuestion)(rl, chalk_1.default.blue('Enter type name: '))) || name
            : name;
        const content = `export interface ${typeName} {\n  // Add properties here\n}\n\nexport type ${typeName}Type = {\n  id: string;\n  name: string;\n};\n`;
        const filePath = `${config.baseDir}/types/${typeName}.types.ts`;
        if ((0, file_1.createFile)(filePath, content, options.replace)) {
            console.log(chalk_1.default.green(`✅ Created type: ${filePath}`));
        }
        else {
            console.log(chalk_1.default.yellow(`⚠️ Type exists: ${filePath} (use --replace to overwrite)`));
        }
        rl.close();
    });
}
