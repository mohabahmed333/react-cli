export function generateHookContent(name: string, useTS: boolean): string {
  return useTS
    ? `import { useState } from 'react';\n\nexport const use${name} = (): [boolean, () => void] => {\n  const [state, setState] = useState(false);\n  const toggle = () => setState(!state);\n  return [state, toggle];\n};\n`
    : `import { useState } from 'react';\n\nexport const use${name} = () => {\n  const [state, setState] = useState(false);\n  const toggle = () => setState(!state);\n  return [state, toggle];\n};\n`;
}
