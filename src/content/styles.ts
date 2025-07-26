export function generateCSSContent(name: string): string {
  return `.container {\n  padding: 20px;\n}\n\n.${name.toLowerCase()} {\n  /* Styles for ${name} */\n}\n`;
}

export function generateStyledComponentsContent(name: string): string {
  return `import styled from 'styled-components';\n\nexport const Container = styled.div\`\n  padding: 20px;\n  /* Styles for ${name} */\n\`;\n\nexport const ${name}Wrapper = styled.div\`\n  /* Additional styles for ${name} */\n\`;\n`;
}
