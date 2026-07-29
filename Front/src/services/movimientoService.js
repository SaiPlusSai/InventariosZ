import api from './axios';

export const movimientoService = {
  registrarMovimiento: (data) => {
    return api.post('/movimientos/', data);
  },
  
  obtenerKardex: (productoId, skip = 0, limit = 100) => {
    return api.get(`/movimientos/producto/${productoId}`, { params: { skip, limit } });
  },

  // --- Sprint 1: Nuevos métodos (Stubs para preparar el módulo) ---
  
  listar: (params = {}) => {
    return api.get('/movimientos/', { params });
  },
  
  obtener: (id) => {
    return api.get(`/movimientos/${id}`);
  },
  
  filtrar: (filtros) => {
    return api.get('/movimientos/filtrar', { params: filtros });
  },
  
  exportar: (filtros) => {
    return api.post('/movimientos/exportar', filtros, { responseType: 'blob' });
  },
  
  importar: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/movimientos/importar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};
