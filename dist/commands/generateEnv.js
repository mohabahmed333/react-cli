"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerGenerateEnv = registerGenerateEnv;
const chalk_1 = __importDefault(require("chalk"));
const file_1 = require("../utils/file");
function registerGenerateEnv(generate, rl) {
    generate
        .command('env')
        .description('Create environment configuration files')
        .option('--replace', 'Replace file if it exists')
        .action(async (options) => {
        const replace = options.replace;
        (0, file_1.createFile)('.env', '# Environment variables\nREACT_APP_API_URL=http://localhost:3000/api\n', replace);
        (0, file_1.createFile)('.env.development', '# Development environment\nREACT_APP_ENV=development\n', replace);
        (0, file_1.createFile)('.env.production', '# Production environment\nREACT_APP_ENV=production\n', replace);
        console.log(chalk_1.default.green('✅ Created environment files'));
        rl.close();
    });
}
