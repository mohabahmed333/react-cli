export function getFileExtension(type: string, useTS: boolean): string {
    return useTS 
      ? type === 'hook' ? 'ts' : 'tsx' 
      : type === 'hook' ? 'js' : 'jsx';
  }
  