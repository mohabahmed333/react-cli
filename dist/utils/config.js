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
const buildTools_1 = require("./buildTools");
const generative_ai_1 = require("@google/generative-ai");
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
    console.log(chalk_1.default.yellow('\n⚙️ First-time setup'));
    const config = { ...defaultConfig };
    config.baseDir = (await (0, prompt_1.askQuestion)(rl, chalk_1.default.blue('Project base directory (src/app): '))) || 'src';
    config.projectType = (await (0, prompt_1.askQuestion)(rl, chalk_1.default.blue('Project type (react/next): '))) || 'react';
    const buildTool = await (0, prompt_1.askQuestion)(rl, chalk_1.default.blue('Build tool (vite/react-scripts): '));
    config.buildTool = buildTool || 'vite';
    const toolConfig = (0, buildTools_1.getBuildToolConfig)({ buildTool: config.buildTool });
    if (config.buildTool !== toolConfig.id) {
        console.log(chalk_1.default.yellow(`Warning: Unknown build tool "${config.buildTool}". Defaulting to vite.`));
        config.buildTool = 'vite';
    }
    config.typescript = (await (0, prompt_1.askQuestion)(rl, chalk_1.default.blue('Use TypeScript? (y/n): '))) === 'y';
    if (config.projectType === 'next') {
        config.buildTool = 'next';
        config.localization = (await (0, prompt_1.askQuestion)(rl, chalk_1.default.blue('Use [lang] localization? (y/n): '))) === 'y';
    }
    // AI Configuration
    config.aiEnabled = (await (0, prompt_1.askQuestion)(rl, chalk_1.default.blue('Enable AI features? (y/n): '))) === 'y';
    if (config.aiEnabled) {
        config.aiModel = await (0, prompt_1.askQuestion)(rl, chalk_1.default.blue('Gemini model (gemini-1.5-flash/gemini-1.5-pro): ')) || 'gemini-1.5-flash-latest';
        console.log(chalk_1.default.yellow('Note: Add GEMINI_API_KEY to .env for AI features'));
    }
    const customPort = await (0, prompt_1.askQuestion)(rl, chalk_1.default.blue('Custom dev server port (leave empty for default): '));
    if (customPort) {
        config.port = parseInt(customPort, 10);
    }
    fs_1.default.writeFileSync(configPath, JSON.stringify(config, null, 2));
    return config;
}
