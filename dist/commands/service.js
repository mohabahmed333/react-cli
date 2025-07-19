"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleService = handleService;
const chalk_1 = __importDefault(require("chalk"));
const config_1 = require("../utils/config");
const prompt_1 = require("../utils/prompt");
const file_1 = require("../utils/file");
function handleService(program, rl) {
    program
        .command('service <name>')
        .description('Create a service file for API calls')
        .option('--ts', 'Override TypeScript setting')
        .option('-i, --interactive', 'Use interactive mode')
        .action(async (name, options) => {
        const config = await (0, config_1.setupConfiguration)(rl);
        const useTS = options.ts ?? config.typescript;
        const serviceName = options.interactive
            ? (await (0, prompt_1.askQuestion)(rl, chalk_1.default.blue('Enter service name: '))) || name
            : name;
        const ext = useTS ? 'ts' : 'js';
        const folderPath = `${config.baseDir}/services`;
        (0, file_1.createFolder)(folderPath);
        const content = useTS
            ? `// If using Node.js < 18, install 'node-fetch' and import it here:\n// import fetch from 'node-fetch';\n\nexport const ${serviceName}Service = {\n  async fetchData(url: string): Promise<any> {\n    const response = await fetch(url);\n    if (!response.ok) {\n      throw new Error(\`HTTP error! status: \${response.status}\`);\n    }\n    return await response.json();\n  },\n  // Add more API methods here\n};\n`
            : `// If using Node.js < 18, install 'node-fetch' and import it here:\n// import fetch from 'node-fetch';\n\nexport const ${serviceName}Service = {\n  async fetchData(url) {\n    const response = await fetch(url);\n    if (!response.ok) {\n      throw new Error(\`HTTP error! status: \${response.status}\`);\n    }\n    return await response.json();\n  },\n  // Add more API methods here\n};\n`;
        const filePath = `${folderPath}/${serviceName}Service.${ext}`;
        if ((0, file_1.createFile)(filePath, content, options.replace)) {
            console.log(chalk_1.default.green(`✅ Created service: ${filePath}`));
        }
        else {
            console.log(chalk_1.default.yellow(`⚠️ Service exists: ${filePath} (use --replace to overwrite)`));
        }
        rl.close();
    });
}
