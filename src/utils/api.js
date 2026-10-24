const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && !['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? 'https://arkdevpro-backend.onrender.com'
    : '')
).replace(/\/+$/, '');

const TOKEN_STORAGE_KEY = 'arkdev_session_token';

export function getSessionToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setSessionToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors in restricted environments
  }
}

export function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const sessionToken = getSessionToken();

  const headers = {
    ...(options.headers || {})
  };

  if (sessionToken && !headers['x-session-token']) {
    headers['x-session-token'] = sessionToken;
  }

  return fetch(url, {
    ...options,
    credentials: 'include',
    headers
  });
}
