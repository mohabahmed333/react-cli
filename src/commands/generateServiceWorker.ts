import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { setupConfiguration } from '../utils/config';
import { createFile } from '../utils/file';

export function registerGenerateServiceWorker(generate: Command, rl: any) {
  generate
    .command('service-worker')
    .description('Create a service worker for PWA support')
    .option('--replace', 'Replace file if it exists')
    .action(async (options: any) => {
      const config = await setupConfiguration(rl);
      const filePath = path.join(config.baseDir, 'serviceWorker.js');
      const content = `// Service Worker implementation\nself.addEventListener('install', (event) => {\n  event.waitUntil(\n    caches.open('app-cache').then((cache) => {\n      return cache.addAll([\n        '/',\n        '/index.html',\n        // Add core assets to cache\n      ]);\n    })\n  );\n});\n\nself.addEventListener('fetch', (event) => {\n  event.respondWith(\n    caches.match(event.request).then((response) => {\n      return response || fetch(event.request);\n    })\n  );\n});\n`;
      if (createFile(filePath, content, options.replace)) {
        console.log(chalk.green(`✅ Created service worker: ${filePath}`));
      } else {
        console.log(chalk.yellow(`⚠️ Service worker exists: ${filePath} (use --replace to overwrite)`));
      }
      rl.close();
    });
}
