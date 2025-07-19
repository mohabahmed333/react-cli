"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerGenerateServiceWorker = registerGenerateServiceWorker;
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../utils/config");
const file_1 = require("../utils/file");
function registerGenerateServiceWorker(generate, rl) {
    generate
        .command('service-worker')
        .description('Create a service worker for PWA support')
        .option('--replace', 'Replace file if it exists')
        .action(async (options) => {
        const config = await (0, config_1.setupConfiguration)(rl);
        const filePath = path_1.default.join(config.baseDir, 'serviceWorker.js');
        const content = `// Service Worker implementation\nself.addEventListener('install', (event) => {\n  event.waitUntil(\n    caches.open('app-cache').then((cache) => {\n      return cache.addAll([\n        '/',\n        '/index.html',\n        // Add core assets to cache\n      ]);\n    })\n  );\n});\n\nself.addEventListener('fetch', (event) => {\n  event.respondWith(\n    caches.match(event.request).then((response) => {\n      return response || fetch(event.request);\n    })\n  );\n});\n`;
        if ((0, file_1.createFile)(filePath, content, options.replace)) {
            console.log(chalk_1.default.green(`✅ Created service worker: ${filePath}`));
        }
        else {
            console.log(chalk_1.default.yellow(`⚠️ Service worker exists: ${filePath} (use --replace to overwrite)`));
        }
        rl.close();
    });
}
