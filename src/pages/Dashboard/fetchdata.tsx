// src/apiConfig.js

const BASE_URL = 'https://api.socialverseapp.com';

const fetchData = async (options = {}) => {
  try {
    const response = await fetch(`${BASE_URL}`, {
      headers: {
        'Content-Type': 'application/json',
        // Include any additional headers if required (e.g., Authorization)
        // 'Authorization': 'Bearer YOUR_TOKEN_HERE',
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data; // Return the data to the caller
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error; // Rethrow the error to handle it in the calling code
  }
};

export default fetchData;
