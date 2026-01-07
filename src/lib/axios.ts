import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Create an axios instance with default configuration
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor - handle errors globally and token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { refreshToken, setTokens } = useAuthStore.getState();
        
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        // We use a clean axios instance to avoid infinite loops with interceptors
        // if the refresh endpoint itself returns 401
        const response = await axios.post(
             `${apiClient.defaults.baseURL}/auth/refresh/`,
             { refresh: refreshToken }
        );

        const { access } = response.data;
        
        setTokens(access, refreshToken); // Keep same refresh token? The API might return a new one, but based on docs it only returns access.
        
        // If the API returns a new refresh token (some do rotation), handle it. 
        // Docs say: { "access": "..." } only for refresh response.
        
        apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + access;
        originalRequest.headers['Authorization'] = 'Bearer ' + access;
        
        processQueue(null, access);
        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        useAuthStore.getState().logout();
        window.location.href = '/auth/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
