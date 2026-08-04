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

// Global request interceptor/runner
async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
    // The Gateway expects X-User-Role occasionally or does authorization via JWT.
    // The spec says: "every JWT carries a role claim of PASSENGER, STAFF, or ADMIN.
    // Staff/Admin-only endpoints must be called only from the corresponding dashboards,
    // and the frontend must hide/disable those UI actions."
  }

  const config = {
    ...options,
    headers
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch {
    throw new ApiError(500, 'Network error. Please check your internet connection or server status.');
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
  post: (path, body, headers = {}) => request(path, { method: 'POST', body: JSON.stringify(body), headers }),
  put: (path, body, headers = {}) => request(path, { method: 'PUT', body: JSON.stringify(body), headers }),
  delete: (path, headers = {}) => request(path, { method: 'DELETE', headers })
};
