import api from './axios';

export const movimientoService = {
  registrarMovimiento: (data) => {
    return api.post('/movimientos/', data);
  },
  
  obtenerKardex: (productoId, skip = 0, limit = 100) => {
    return api.get(`/movimientos/producto/${productoId}`, { params: { skip, limit } });
  }
};
