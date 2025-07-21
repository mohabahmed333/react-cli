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
const defaultConfig = {
    baseDir: 'src',
    projectType: 'react',
    buildTool: 'vite',
    typescript: false,
    localization: false,
    port: 5173
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
    const customPort = await (0, prompt_1.askQuestion)(rl, chalk_1.default.blue(`Development server port (${toolConfig.defaultPort}): `));
    if (customPort && !isNaN(parseInt(customPort))) {
        config.port = parseInt(customPort);
    }
    else {
        config.port = toolConfig.defaultPort;
    }
    fs_1.default.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(chalk_1.default.green('✅ Configuration saved'));
    return config;
}
