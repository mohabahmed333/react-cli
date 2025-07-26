export function generateLibContent(name: string, useTS: boolean): string {
  return useTS
    ? `export const ${name.toUpperCase()}_CONSTANT: string = 'value';\n`
    : `export const ${name.toUpperCase()}_CONSTANT = 'value';\n`;
}
