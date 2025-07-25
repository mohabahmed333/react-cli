import fg from 'fast-glob';
import path from 'path';

export interface ScanConfig {
  baseDir: string;
  include: string[];
  exclude?: string[];
}

/**
 * Scans the project for files matching the include/exclude patterns.
 * @param config ScanConfig
 * @returns string[] - list of file paths
 */
export async function scanProjectFiles(config: ScanConfig): Promise<string[]> {
  const { baseDir, include, exclude } = config;
  const patterns = include.map((pattern) => path.join(baseDir, pattern));
  const options: fg.Options = {
    ignore: exclude?.map((pattern) => path.join(baseDir, pattern)),
    onlyFiles: true,
    absolute: true,
  };
  return fg(patterns, options);
} 