import { FileExtension, GeneratorType } from "../../types/generator-type";

/**
 * Formats a filename according to the component type and extension
 * @param baseName - The base name of the file (e.g., 'useDarkMode', 'Dashboard')
 * @param type - The generator type (hook, layout, component, etc.)
 * @param ext - The file extension (ts, tsx, js, jsx)
 * @returns Formatted filename with appropriate suffixes and extension
 */
export function formatFileName(
    baseName: string, 
    type: GeneratorType, 
    ext: FileExtension
  ): string {
    const typeSuffixes: Partial<Record<GeneratorType, string>> = {
      layout: 'Layout',
      hoc: 'HOC',
      guard: 'Guard',
      service: 'Service',
      'test-utils': 'test-utils'
    };
  
    const suffix = typeSuffixes[type] || '';
    const separator = type === 'test-utils' ? '-' : '';
    
    return `${baseName}${separator}${suffix}.${ext}`;
  }