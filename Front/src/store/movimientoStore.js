import { create } from 'zustand';
import { movimientoService } from '../services/movimientoService';

const useMovimientoStore = create((set, get) => ({
  movimientos: [],
  totalMovimientos: 0,
  loading: false,
  error: null,
  
  // --- Sprint 1 & 3: Estructura base para Listado, Kardex y Dashboard ---
  selectedRows: [],
  pagination: {
    page: 1,
    limit: 50
  },
  sortConfig: {
    key: 'fecha',
    direction: 'desc'
  },
  filters: {
    search: '',
    codigo: '',
    marca: '',
    tipoCalzado: '',
    material: '',
    color: '',
    talla: '',
    tipoMovimiento: null,
    origen: null,
    fechaInicio: null,
    fechaFin: null,
    productoId: null,
    cantidadMin: null,
    cantidadMax: null,
    observacion: ''
  },

  setFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters },
    pagination: { ...state.pagination, page: 1 }
  })),

  clearFilters: () => set((state) => ({
    filters: {
      search: '',
      codigo: '',
      marca: '',
      tipoCalzado: '',
      material: '',
      color: '',
      talla: '',
      tipoMovimiento: null,
      origen: null,
      fechaInicio: null,
      fechaFin: null,
      productoId: null,
      cantidadMin: null,
      cantidadMax: null,
      observacion: ''
    },
    pagination: { ...state.pagination, page: 1 }
  })),

  setPagination: (newPagination) => set((state) => ({
    pagination: { ...state.pagination, ...newPagination }
  })),

  setSortConfig: (key, direction) => set((state) => ({
    sortConfig: { key, direction },
    pagination: { ...state.pagination, page: 1 }
  })),

  setSelectedRows: (selectedRows) => set({ selectedRows }),
  clearSelectedRows: () => set({ selectedRows: [] }),
  // -----------------------------------------------------------------
  
  fetchMovimientos: async () => {
    const { pagination, filters, sortConfig } = get();
    set({ loading: true, error: null });
    try {
      const skip = (pagination.page - 1) * pagination.limit;
      const params = {
        skip,
        limit: pagination.limit,
        sort_by: sortConfig.key,
        sort_order: sortConfig.direction,
      };

      // Limpiar filtros nulos o vacíos antes de enviarlos
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== '') {
          // Convert camelCase to snake_case for backend
          const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
          params[snakeKey] = filters[key];
        }
      });

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
