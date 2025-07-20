// API Configuration utility

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Get the full API URL by appending the endpoint to the base URL
 * @param {string} endpoint - The API endpoint (should start with /)
 * @returns {string} - The complete API URL
 */
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

/**
 * Get the base API URL
 * @returns {string} - The base API URL
 */
export const getBaseUrl = () => {
  return API_BASE_URL;
};

export default {
  getApiUrl,
  getBaseUrl,
};
