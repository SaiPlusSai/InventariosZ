import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10)

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Add token if available
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.customMessage = "No fue posible conectar con el servidor.";
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      window.location.href = '/login'
    }

    const data = error.response.data;
    if (data && data.error && data.error.message) {
      error.customMessage = data.error.message;
    } else if (data && data.detail && typeof data.detail === 'string') {
      error.customMessage = data.detail;
    } else {
      error.customMessage = "Ocurrió un error inesperado. Inténtelo nuevamente.";
    }

    // Retro-compatibility hack for existing components using err.response?.data?.detail
    if (error.response) {
      if (!error.response.data) error.response.data = {};
      error.response.data.detail = error.customMessage;
    }
    
    // Override native message for components that fallback to err.message (which was 'Network Error')
    error.message = error.customMessage;

    return Promise.reject(error)
  }
)

export default axiosInstance
