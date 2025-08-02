"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupConfiguration = setupConfiguration;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
const prompt_1 = require("./prompt");
const generative_ai_1 = require("@google/generative-ai");
const intelligentConfig_1 = require("./intelligentConfig");
const defaultConfig = {
    baseDir: 'src',
    projectType: 'react',
    buildTool: 'vite',
    typescript: false,
    localization: false,
    port: 5173,
    aiEnabled: false,
    aiProvider: 'gemini',
    aiModel: 'gemini-1.5-flash-latest',
    aiSafetySettings: [
        { category: generative_ai_1.HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: generative_ai_1.HarmBlockThreshold.BLOCK_NONE },
        { category: generative_ai_1.HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: generative_ai_1.HarmBlockThreshold.BLOCK_NONE }
    ]
};
async function setupConfiguration(rl) {
    const configPath = path_1.default.join(process.cwd(), 'create.config.json');
    try {
        if (fs_1.default.existsSync(configPath)) {
            return JSON.parse(fs_1.default.readFileSync(configPath, 'utf8'));
        }
    }
    catch (e) {
        console.error(chalk_1.default.red('Error reading config:'), e);
    }
    console.log(chalk_1.default.yellow('\n⚙️ Intelligent Project Setup'));
    // Use intelligent configuration detection
    const intelligentConfig = await (0, intelligentConfig_1.setupIntelligentConfiguration)(rl);
    // Convert intelligent config to CLI config
    const config = {
        ...defaultConfig,
        baseDir: intelligentConfig.baseDir,
        typescript: intelligentConfig.typescript,
        // Detect project type based on structure and dependencies
        projectType: intelligentConfig.hasAppFolder ? 'next' : 'react',
        buildTool: intelligentConfig.hasAppFolder ? 'next' : 'vite'
    };
    // Additional configuration questions
    if (config.projectType === 'next') {
        config.localization = (await (0, prompt_1.askQuestion)(rl, chalk_1.default.blue('Use [lang] localization? (y/n): '))) === 'y';
    }
    // AI Configuration
    config.aiEnabled = (await (0, prompt_1.askQuestion)(rl, chalk_1.default.blue('Enable AI features? (y/n): '))) === 'y';
    if (config.aiEnabled) {
        const aiProvider = await (0, prompt_1.askQuestion)(rl, chalk_1.default.blue('Choose AI provider (gemini/mistral): ')) || 'gemini';
        config.aiProvider = ['gemini', 'mistral'].includes(aiProvider) ? aiProvider : 'gemini';
        if (config.aiProvider === 'mistral') {
            config.aiModel = await (0, prompt_1.askQuestion)(rl, chalk_1.default.blue('Mistral model (mistral-large/mistral-medium/mistral-small): ')) || 'mistral-large-latest';
            if (!config.aiModel.includes('latest')) {
                config.aiModel = config.aiModel + '-latest';
            }
            console.log(chalk_1.default.yellow('Note: Add MISTRAL_API_KEY to .env for Mistral AI features'));
        }
        else {
            config.aiModel = await (0, prompt_1.askQuestion)(rl, chalk_1.default.blue('Gemini model (gemini-1.5-flash/gemini-1.5-pro): ')) || 'gemini-1.5-flash-latest';
            if (!config.aiModel.includes('latest')) {
                config.aiModel = config.aiModel + '-latest';
            }
            console.log(chalk_1.default.yellow('Note: Add GEMINI_API_KEY to .env for Gemini AI features'));
        }
    }
    const customPort = await (0, prompt_1.askQuestion)(rl, chalk_1.default.blue('Custom dev server port (leave empty for default): '));
    if (customPort) {
        config.port = parseInt(customPort, 10);
    }
    fs_1.default.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(chalk_1.default.green('\n✅ Configuration saved!'));
    console.log(chalk_1.default.blue('📋 Final Configuration:'));
    console.log(`  ${chalk_1.default.gray('Base Directory:')} ${config.baseDir}`);
    console.log(`  ${chalk_1.default.gray('Project Type:')} ${config.projectType}`);
    console.log(`  ${chalk_1.default.gray('Build Tool:')} ${config.buildTool}`);
    console.log(`  ${chalk_1.default.gray('TypeScript:')} ${config.typescript ? '✅' : '❌'}`);
    console.log(`  ${chalk_1.default.gray('AI Features:')} ${config.aiEnabled ? '✅' : '❌'}`);
    return config;
}
