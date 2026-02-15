/**
 * Setup global axios interceptors for authentication and error handling
 * Note: 401 errors are handled by the AuthProvider's checkError method,
 * not here, to avoid conflicting redirect logic
 */

export const setupAxiosInterceptors = (): void => {
  // Interceptors are set up by the auth provider via checkError
  // This function is kept for future use if needed
};
