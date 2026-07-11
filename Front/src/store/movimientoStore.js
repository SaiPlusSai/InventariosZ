import { create } from 'zustand';
import { movimientoService } from '../services/movimientoService';

const useMovimientoStore = create((set, get) => ({
  movimientos: [],
  totalMovimientos: 0,
  loading: false,
  error: null,
  
  fetchKardex: async (productoId, skip = 0, limit = 100) => {
    set({ loading: true, error: null });
    try {
      const response = await movimientoService.obtenerKardex(productoId, skip, limit);
      set({ 
        movimientos: response.data.items,
        totalMovimientos: response.data.total,
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Error al cargar el Kardex', 
        loading: false 
      });
    }
  },

  registrarMovimiento: async (payload) => {
    set({ loading: true, error: null });
    try {
      const response = await movimientoService.registrarMovimiento(payload);
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Error al registrar el movimiento', 
        loading: false 
      });
      throw error;
    }
  }
}));

export default useMovimientoStore;
