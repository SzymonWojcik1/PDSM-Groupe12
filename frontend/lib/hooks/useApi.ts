'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Custom Hook: useApi
 * 
 * This hook provides a wrapper for making authenticated API calls.
 * Features include:
 * - Automatic token management
 * - Authentication header injection
 * - Error handling for unauthorized requests
 * - Automatic redirection on authentication failure
 * 
 * @returns {Object} An object containing the callApi function
 * @property {Function} callApi - Function to make authenticated API calls
 */
export function useApi() {
  const router = useRouter();

  /**
   * Makes an authenticated API call with proper headers and error handling
   * 
   * @param url - The API endpoint URL
   * @param options - Optional fetch configuration (headers, method, body, etc.)
   * @returns Promise<Response> The fetch response
   */
  const callApi = useCallback(async (url: string, options: RequestInit = {}) => {
    // Get authentication token from localStorage
    const token = localStorage.getItem('token');

    // Prepare headers with authentication and content type
    const headers: HeadersInit = {
      ...(options.headers || {}),
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    // Make the API call with configured options
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle unauthorized access (401)
    if (response.status === 401) {
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('2fa_validated');
      // Redirect to login page
      router.replace('/login');
    }

    return response;
  }, [router]);

  return { callApi };
}
