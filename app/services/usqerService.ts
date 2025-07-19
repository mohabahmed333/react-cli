import axios from 'axios';

export const usqerService = {
  async fetchData(url: string): Promise<any> {
    const response = await axios.get(url);
    return response.data;
  },
  // Add more API methods here
};
