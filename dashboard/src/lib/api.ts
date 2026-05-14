import Cookies from 'js-cookie';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3003';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = Cookies.get('token');
  
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Set default content type for JSON if body is a string
  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BACKEND_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // If unauthorized, clear token and maybe redirect
    Cookies.remove('token');
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }

  return response;
}
