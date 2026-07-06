import { create } from 'zustand'

export const useProductoStore = create((set) => ({
  // ==========================
  // Estados
  // ==========================

  productos: [],
  productoDetalle: null,
  productoEditar: null,

  loading: false,
  loadingDetalle: false,
  loadingEditar: false,

  error: null,

  // ==========================
  // Setters
  // ==========================

  setProductos: (productos) =>
    set({ productos }),

  setProductoDetalle: (productoDetalle) =>
    set({ productoDetalle }),

  setProductoEditar: (productoEditar) =>
    set({ productoEditar }),

  clearProductoDetalle: () =>
    set({ productoDetalle: null }),

  clearProductoEditar: () =>
    set({ productoEditar: null }),

  setLoading: (loading) =>
    set({ loading }),

  setLoadingDetalle: (loadingDetalle) =>
    set({ loadingDetalle }),

  setLoadingEditar: (loadingEditar) =>
    set({ loadingEditar }),

  setError: (error) =>
    set({ error }),

  // ==========================
  // CRUD Local
  // ==========================

  addProducto: (producto) =>
    set((state) => ({
      productos: [...state.productos, producto],
    })),

  updateProducto: (id, updatedProducto) =>
    set((state) => ({
      productos: state.productos.map((producto) =>
        producto.id === id
          ? { ...producto, ...updatedProducto }
          : producto
      ),
    })),

  actualizarStock: (id, stock_actual) =>
    set((state) => ({
      productos: state.productos.map((producto) =>
        producto.id === id
          ? {
              ...producto,
              stock_actual,
            }
          : producto
      ),
    })),

  deleteProducto: (id) =>
    set((state) => ({
      productos: state.productos.filter(
        (producto) => producto.id !== id
      ),
    })),

  // ==========================
  // Limpiar
  // ==========================

  clearProductos: () =>
    set({
      productos: [],
      productoDetalle: null,
      productoEditar: null,
      error: null,
    }),
}))