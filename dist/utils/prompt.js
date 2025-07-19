"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.askQuestion = askQuestion;
function askQuestion(rl, question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}
