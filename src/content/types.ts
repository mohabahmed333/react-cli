export function generateTypesContent(name: string): string {
  return `export interface ${name}Props {\n  // Add props here\n}\n\nexport type ${name}Type = {\n  id: string;\n  name: string;\n};\n`;
}
