import { create } from 'zustand';
import { movimientoService } from '../services/movimientoService';

const useMovimientoStore = create((set, get) => ({
  movimientos: [],
  totalMovimientos: 0,
  loading: false,
  error: null,
  
  // --- Sprint 1: Estructura base para Listado, Kardex y Dashboard ---
  selectedRows: [],
  pagination: {
    page: 1,
    limit: 50
  },
  filters: {
    search: '',
    tipoMovimiento: null,
    origen: null,
    fechaInicio: null,
    fechaFin: null,
    productoId: null
  },

  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters },
    pagination: { ...state.pagination, page: 1 }
  })),

  clearFilters: () => set((state) => ({
    filters: {
      search: '',
      tipoMovimiento: null,
      origen: null,
      fechaInicio: null,
      fechaFin: null,
      productoId: null
    },
    pagination: { ...state.pagination, page: 1 }
  })),

  setPagination: (newPagination) => set((state) => ({
    pagination: { ...state.pagination, ...newPagination }
  })),

  setSelectedRows: (selectedRows) => set({ selectedRows }),
  clearSelectedRows: () => set({ selectedRows: [] }),
  // -----------------------------------------------------------------
  
  fetchMovimientos: async () => {
    const { pagination, filters } = get();
    set({ loading: true, error: null });
    try {
      const skip = (pagination.page - 1) * pagination.limit;
      const params = {
        skip,
        limit: pagination.limit,
        // En futuros Sprints aquí se enviarán los filters
      };
      const response = await movimientoService.listar(params);
      set({ 
        movimientos: response.data,
        totalMovimientos: response.total,
        pagination: { ...pagination, total: response.total },
        loading: false 
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.detail || 'Error al cargar los movimientos', 
        loading: false 
      });
    }
  },

  refreshMovimientos: async () => {
    set((state) => ({ pagination: { ...state.pagination, page: 1 } }));
    await get().fetchMovimientos();
  },

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
