import axios from 'axios'
import { ENV } from '../config/env'

const API_BASE_URL = ENV.apiUrl
const API_TIMEOUT = ENV.apiTimeout

const defaultHeaders = {
  "Content-Type": "application/json",
  ...(ENV.env === "ngrok" && { "ngrok-skip-browser-warning": "true" }),
};

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: defaultHeaders,
});

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
    
    // Add logic to check for REGISTRO_EN_PAPELERA or REGISTRO_EXISTENTE
    if (error.response.status === 409 && data?.error === 'REGISTRO_EN_PAPELERA') {
      error.isPapelera = true;
      error.papeleraData = { id_registro: data.id };
      error.customMessage = data.message || 'El registro se encuentra en la papelera.';
    } else if (error.response.status === 409 && data?.error === 'WARNING_CODIGO_OTRA_MARCA') {
      error.isWarning = true;
      error.warningData = {
        codigo: data.codigo,
        marca_conflicto: data.marca_conflicto,
        marca_destino: data.marca_destino
      };
      error.customMessage = data.message || 'Advertencia: el código ya existe en otra marca.';
    } else if (error.response.status === 409 && data?.error === 'CODIGO_PRODUCTO_DUPLICADO') {
      error.customMessage = data.message || 'El código ya existe para esta marca.';
    } else if (error.response.status === 409 && data?.error === 'REGISTRO_EXISTENTE') {
      error.customMessage = data.message || 'El registro ya existe.';
    } else if (error.response.status === 409 && data?.error === 'CONFLICTO_RECUPERACION') {
      error.customMessage = data.message || 'Error de conflicto al recuperar el registro.';
    } else if (data && data.error && data.error.message) {
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
