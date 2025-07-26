export function generateUtilsContent(name: string, useTS: boolean): string {
  return useTS
    ? `export const format${name} = (input: string): string => {\n  return input.toUpperCase();\n};\n`
    : `export const format${name} = (input) => {\n  return input.toUpperCase();\n};\n`;
}
