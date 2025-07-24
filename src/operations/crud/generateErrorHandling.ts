export function generateErrorHandlerTS(type: string, Resource: string): string {
    switch (type) {
      case 'basic':
        return `
  function handle${Resource}Error(error: unknown): never {
    console.error('${Resource} error:', error);
    throw error;
  }`;
  
      case 'detailed':
        return `
  function handle${Resource}Error(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const apiError: ApiError = {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        data: error.response?.data
      };
      throw apiError;
    }
    throw new Error(\`Unknown ${Resource} error: \${String(error)}\`);
  }`;
  
      case 'toast':
        return `
  function handle${Resource}Error(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
      throw { message, status: error.response?.status };
    }
    toast.error('Unknown ${Resource} error');
    throw new Error('Unknown error occurred');
  }`;
  
      default:
        return '';
    }
  }
  
  export function generateAxiosHandlerTS(method: string, url: string, errorHandler: string, Resource: string, dataParam = ''): string {
    return `
    try {
      const response = await axios.${method}<${Resource}>(${url}${dataParam ? `, ${dataParam}` : ''});
      return response.data;
    } catch (error) {
      handle${Resource}Error(error);
    }`;
  }