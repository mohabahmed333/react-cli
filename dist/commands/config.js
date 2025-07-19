"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleConfig = handleConfig;
exports.handleInit = handleInit;
const chalk_1 = __importDefault(require("chalk"));
const config_1 = require("../utils/config");
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
}
function handleInit(program, rl) {
    program
        .command('init')
        .description('Initialize project config')
        .action(async () => {
        await (0, config_1.setupConfiguration)(rl);
        rl.close();
    });
}
