export const ENV = {
  appName: import.meta.env.VITE_APP_NAME,
  env: import.meta.env.VITE_ENV,
  apiUrl: import.meta.env.VITE_API_URL,
  websocketUrl: import.meta.env.VITE_WS_URL,
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10),
};
