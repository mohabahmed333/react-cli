export function getFileExtension(type: string, useTS: boolean): string {
  // Handle special file types first
  if (type === 'css') return 'css';
  if (type === 'json') return 'json';
  if (type === 'md') return 'md';
  if (type === 'html') return 'html';
  
  // Handle TypeScript/JavaScript files
  return useTS 
    ? type === 'hook' ? 'ts' : 'tsx' 
    : type === 'hook' ? 'js' : 'jsx';
}
  