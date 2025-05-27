'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function useApi() {
  const router = useRouter();

  const callApi = useCallback(async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');

    const headers: HeadersInit = {
      ...(options.headers || {}),
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Token invalide ou expiré
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('2fa_validated');
      router.replace('/login');
    }

    return response;
  }, [router]);

  return { callApi };
}
