import Cookies from 'js-cookie';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3003';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = Cookies.get('token');
  
  // 1. Construimos un objeto plano para las cabeceras.
  // Esto evita el error de caracteres no válidos al asignar el token.
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // 2. Si hay token, lo añadimos de forma segura.
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // 3. Establecemos Content-Type por defecto solo si no se ha definido.
  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  // 4. Realizamos la petición usando el objeto headers plano.
  const response = await fetch(`${BACKEND_URL}${url}`, {
    ...options,
    headers,
  });

  // 5. Manejo de autenticación.
  if (response.status === 401) {
    Cookies.remove('token');
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }

  return response;
}
