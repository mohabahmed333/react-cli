
// If using Node.js < 18, install 'node-fetch' and import it here:
// import fetch from 'node-fetch';

export const userService = {
  async fetchData(url: string): Promise<any> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  },
  // Add more API methods here
};
