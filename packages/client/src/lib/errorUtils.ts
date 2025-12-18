import axios from 'axios';

/**
 * Extracts a user-friendly error message from an error object.
 * Specifically handles 429 rate limit errors.
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    // Check if it's a rate limit error (429)
    if (error.response?.status === 429) {
      // Return the server's rate limit message
      return (
        error.response?.data?.message ||
        'Too many requests. Please wait a moment and try again.'
      );
    }

    // Handle other HTTP errors
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    // Network or connection error
    if (error.request) {
      return 'Unable to connect to the server. Please check your connection.';
    }
  }

  // Generic fallback
  return 'Something went wrong. Please try again.';
}
