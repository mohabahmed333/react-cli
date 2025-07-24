import { Command } from 'commander';
import { handleNamedType, handleTypeLegacy } from './typeHelpers';

export function registerGenerateType(generate: Command, rl: any) {
  generate
    .command('type [name] [folder]')
    .description('Generate TypeScript types (optionally in a specific folder under app/)')
    .option('--ts', 'Override TypeScript setting')
    .option('-i, --interactive', 'Use interactive mode for type and folder selection')
    .option('--replace', 'Replace file if it exists')
    .action(async (name: string | undefined, folder: string | undefined, options: any) => {
      await handleTypeLegacy(name, folder, options, rl);
    });

  generate
    .command('enum [name] [folder]')
    .description('Generate a TypeScript enum (optionally in a specific folder under app/)')
    .option('-i, --interactive', 'Use interactive mode for enum and folder selection')
    .option('--replace', 'Replace file if it exists')
    .action(async (name: string | undefined, folder: string | undefined, options: any) => {
      await handleNamedType('enum', name, folder, options, rl);
    });

  generate
    .command('interface [name] [folder]')
    .description('Generate a TypeScript interface (optionally in a specific folder under app/)')
    .option('-i, --interactive', 'Use interactive mode for interface and folder selection')
    .option('--replace', 'Replace file if it exists')
    .action(async (name: string | undefined, folder: string | undefined, options: any) => {
      await handleNamedType('interface', name, folder, options, rl);
    });

  generate
    .command('class [name] [folder]')
    .description('Generate a TypeScript class (optionally in a specific folder under app/)')
    .option('-i, --interactive', 'Use interactive mode for class and folder selection')
    .option('--replace', 'Replace file if it exists')
    .action(async (name: string | undefined, folder: string | undefined, options: any) => {
      await handleNamedType('class', name, folder, options, rl);
    });
} 