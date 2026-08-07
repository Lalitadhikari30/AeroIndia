const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

let accessToken = localStorage.getItem('accessToken') || null;
let refreshToken = localStorage.getItem('refreshToken') || null;
let authChangeListeners = [];

export const addAuthChangeListener = (listener) => {
  authChangeListeners.push(listener);
};

export const removeAuthChangeListener = (listener) => {
  authChangeListeners = authChangeListeners.filter(l => l !== listener);
};

const notifyAuthChange = (user = null, loggedOut = false) => {
  authChangeListeners.forEach(listener => listener({ user, loggedOut }));
};

export const setTokens = (access, refresh) => {
  accessToken = access;
  refreshToken = refresh;
  if (access) {
    localStorage.setItem('accessToken', access);
  } else {
    localStorage.removeItem('accessToken');
  }

  if (refresh) {
    localStorage.setItem('refreshToken', refresh);
  } else {
    localStorage.removeItem('refreshToken');
  }
};

export const getAccessToken = () => accessToken;
export const getRefreshToken = () => refreshToken;

export class ApiError extends Error {
  constructor(status, message, data = null) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

// Global request interceptor/runner with timeout support
async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const timeoutMs = options.timeoutMs || 15000;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const config = {
    ...options,
    headers,
    signal: controller.signal
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new ApiError(408, 'Request timed out. Please try again.');
    }
    throw new ApiError(500, 'Network error. Please check your internet connection or server status.');
  } finally {
    clearTimeout(timeoutId);
  }

  if (response.status === 401 && refreshToken && !options._retry) {
    // Attempt silent refresh
    try {
      const refreshResponse = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setTokens(data.accessToken, data.refreshToken || refreshToken);
        
        // Retry original request
        return await request(path, { ...options, _retry: true });
      } else {
        // Refresh token invalid/expired, trigger logout
        setTokens(null, null);
        notifyAuthChange(null, true);
      }
    } catch {
      setTokens(null, null);
      notifyAuthChange(null, true);
    }
  }

  if (!response.ok) {
    let errorData = null;
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // response might not be JSON
    }
    throw new ApiError(response.status, errorMessage, errorData);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

export const api = {
  get: (path, headers = {}) => request(path, { method: 'GET', headers }),
  post: (path, body, headers = {}, timeoutMs) => request(path, { method: 'POST', body: JSON.stringify(body), headers, timeoutMs }),
  put: (path, body, headers = {}, timeoutMs) => request(path, { method: 'PUT', body: JSON.stringify(body), headers, timeoutMs }),
  delete: (path, headers = {}) => request(path, { method: 'DELETE', headers }),
  fireAndForget: (path, body, headers = {}) => {
    // Fire-and-forget request with a short 5s timeout that never throws to UI
    request(path, { method: 'POST', body: JSON.stringify(body), headers, timeoutMs: 5000 }).catch(err => {
      console.warn(`[FireAndForget] Request to ${path} skipped/failed:`, err.message);
    });
  }
};
