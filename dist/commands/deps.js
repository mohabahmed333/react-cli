"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDeps = handleDeps;
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
function handleDeps(program, rl) {
    program
        .command('deps')
        .description('Check dependency versions')
        .action(async () => {
        const packageJson = JSON.parse(fs_1.default.readFileSync('package.json', 'utf-8'));
        const deps = packageJson.dependencies || {};
        const devDeps = packageJson.devDependencies || {};
        console.log(chalk_1.default.cyan.bold('\n📦 Dependencies:'));
        Object.entries(deps).forEach(([pkg, version]) => {
            console.log(`- ${pkg}: ${version}`);
        });
        if (Object.keys(devDeps).length) {
            console.log(chalk_1.default.cyan.bold('\n📦 Dev Dependencies:'));
            Object.entries(devDeps).forEach(([pkg, version]) => {
                console.log(`- ${pkg}: ${version}`);
            });
        }
        rl.close();
    });
}
