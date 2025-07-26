"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.askQuestion = askQuestion;
exports.askChoice = askChoice;
exports.askMultiSelect = askMultiSelect;
exports.askBoolean = askBoolean;
const chalk_1 = __importDefault(require("chalk"));
function askQuestion(rl, question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}
/**
 * Ask a single choice question with numbered options
 */
async function askChoice(rl, title, options) {
    const availableOptions = options.filter(opt => opt.condition !== false);
    let prompt = chalk_1.default.blue(`${title}\n`);
    availableOptions.forEach((option, index) => {
        prompt += `${index + 1}. ${option.label}\n`;
    });
    prompt += `Select option (1-${availableOptions.length}): `;
    const answer = await askQuestion(rl, prompt);
    const selectedIndex = parseInt(answer) - 1;
    if (selectedIndex >= 0 && selectedIndex < availableOptions.length) {
        return availableOptions[selectedIndex].value;
    }
    // Invalid selection, ask again
    console.log(chalk_1.default.red('Invalid selection. Please try again.'));
    return askChoice(rl, title, options);
}
/**
 * Ask a multi-select question with numbered options
 */
async function askMultiSelect(rl, title, options) {
    const availableOptions = options.filter(opt => opt.condition !== false);
    let prompt = chalk_1.default.blue(`${title} (separate multiple choices with commas)\n`);
    availableOptions.forEach((option, index) => {
        prompt += `${index + 1}. ${option.label}\n`;
    });
    prompt += `Select options (e.g., 1,3,5) or press Enter for none: `;
    const answer = await askQuestion(rl, prompt);
    const result = {};
    // Initialize all options as false
    availableOptions.forEach(option => {
        result[option.value] = false;
    });
    if (answer.trim()) {
        const selectedNumbers = answer.split(',').map(choice => parseInt(choice.trim()));
        selectedNumbers.forEach(num => {
            const index = num - 1;
            if (index >= 0 && index < availableOptions.length) {
                const option = availableOptions[index];
                result[option.value] = true;
            }
        });
    }
    return result;
}
/**
 * Ask a boolean question with Yes/No options
 */
async function askBoolean(rl, title) {
    const result = await askChoice(rl, title, [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' }
    ]);
    return result === 'true';
}
