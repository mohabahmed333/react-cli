"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleConfig = handleConfig;
exports.handleInit = handleInit;
const chalk_1 = __importDefault(require("chalk"));
const config_1 = require("../utils/config");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function handleConfig(program, rl) {
    program
        .command('config')
        .description('Show current config')
        .action(async () => {
        const config = await (0, config_1.setupConfiguration)(rl);
        console.log(chalk_1.default.cyan('\nCurrent Config:'));
        console.log(JSON.stringify(config, null, 2));
        rl.close();
    });
    program
        .command('enable-ai')
        .description('Enable AI features')
        .action(async () => {
        const configPath = path_1.default.join(process.cwd(), 'create.config.json');
        let config = await (0, config_1.setupConfiguration)(rl);
        // Set required AI configuration
        config.aiEnabled = true;
        config.aiProvider = 'gemini';
        config.aiModel = 'gemini-1.5-flash-latest';
        config.aiSafetySettings = [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' }
        ];
        fs_1.default.writeFileSync(configPath, JSON.stringify(config, null, 2));
        console.log(chalk_1.default.green('\n✅ AI features enabled'));
        console.log(chalk_1.default.yellow('Note: Make sure you have GEMINI_API_KEY in your .env file'));
        rl.close();
    });
    program
        .command('disable-ai')
        .description('Disable AI features')
        .action(async () => {
        const configPath = path_1.default.join(process.cwd(), 'create.config.json');
        let config = await (0, config_1.setupConfiguration)(rl);
        config.aiEnabled = false;
        fs_1.default.writeFileSync(configPath, JSON.stringify(config, null, 2));
        console.log(chalk_1.default.yellow('\n❌ AI features disabled'));
        rl.close();
    });
}
function handleInit(program, rl) {
    program
        .command('init')
        .description('Initialize project config')
        .action(async () => {
        // Delete existing config to force new setup
        const configPath = path_1.default.join(process.cwd(), 'create.config.json');
        if (fs_1.default.existsSync(configPath)) {
            fs_1.default.unlinkSync(configPath);
        }
        const config = await (0, config_1.setupConfiguration)(rl);
        console.log(chalk_1.default.green('\n✅ Configuration updated:'));
        console.log(JSON.stringify(config, null, 2));
        rl.close();
    });
}
