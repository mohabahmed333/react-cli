import { GenerateOptions } from "../utils/generateAIHelper";

 
export interface ServiceOptions extends GenerateOptions {
  crud?: boolean;
  api?: 'axios' | 'react-query' | 'rtk-query';
  errorHandler?: 'basic' | 'detailed' | 'toast';
  outputDir?: string;
  useAxios?: boolean;
  useCrud?: boolean;
}

export function generateServiceContent(name: string, options: ServiceOptions, useTS: boolean): string {
  if (useTS) {
    return `import axios from 'axios';

export interface ${name}Data {
  // Define your data types here
}

export class ${name}Service {
  private baseUrl = '/api/${name.toLowerCase()}';

  async getAll(): Promise<${name}Data[]> {
    const response = await axios.get(this.baseUrl);
    return response.data;
  }

  async getById(id: string): Promise<${name}Data> {
    const response = await axios.get(\`\${this.baseUrl}/\${id}\`);
    return response.data;
  }

  async create(data: ${name}Data): Promise<${name}Data> {
    const response = await axios.post(this.baseUrl, data);
    return response.data;
  }

  async update(id: string, data: Partial<${name}Data>): Promise<${name}Data> {
    const response = await axios.put(\`\${this.baseUrl}/\${id}\`, data);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await axios.delete(\`\${this.baseUrl}/\${id}\`);
  }
}
`;
  } else {
    return `import axios from 'axios';

export class ${name}Service {
  constructor() {
    this.baseUrl = '/api/${name.toLowerCase()}';
  }

  async getAll() {
    const response = await axios.get(this.baseUrl);
    return response.data;
  }

  async getById(id) {
    const response = await axios.get(\`\${this.baseUrl}/\${id}\`);
    return response.data;
  }

  async create(data) {
    const response = await axios.post(this.baseUrl, data);
    return response.data;
  }

  async update(id, data) {
    const response = await axios.put(\`\${this.baseUrl}/\${id}\`, data);
    return response.data;
  }

  async delete(id) {
    await axios.delete(\`\${this.baseUrl}/\${id}\`);
  }
}
`;
  }
}
