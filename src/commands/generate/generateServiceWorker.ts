import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { setupConfiguration } from '../../utils/config';
import { createGeneratedFile } from '../../utils/file/createGeneratedFile';
import { Interface as ReadlineInterface } from 'readline';

interface ServiceWorkerOptions {
  replace?: boolean;
}

export function registerGenerateServiceWorker(generate: Command, rl: ReadlineInterface) {
  generate
    .command('service-worker')
    .description('Create a service worker for PWA support')
    .option('--replace', 'Replace file if it exists')
    .action(async (options: ServiceWorkerOptions) => {
      try {
        const config = await setupConfiguration(rl);
        const targetDir = config.baseDir;
        const fileName = 'serviceWorker';
        
        const defaultContent = generateServiceWorkerContent();

        await createGeneratedFile({
          rl,
          config,
          type: 'workers',
          name: fileName,
          targetDir,
          useTS: false, // Service workers are always JavaScript
          replace: options.replace ?? false,
          defaultContent
        });

        console.log(chalk.green(`✅ Successfully generated service worker`));
      } catch (error) {
        console.error(chalk.red('❌ Error generating service worker:'), error instanceof Error ? error.message : error);
      } finally {
        rl.close();
      }
    });
}

function generateServiceWorkerContent(): string {
  return `// Service Worker implementation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('app-cache').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        // Add core assets to cache
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Add more event listeners as needed
self.addEventListener('activate', (event) => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== 'app-cache')
          .map((name) => caches.delete(name))
      );
    })
  );
});
`;
}