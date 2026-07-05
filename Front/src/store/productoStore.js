import { create } from 'zustand'

export const useProductoStore = create((set) => ({
  // ==========================
  // Estados
  // ==========================

  productos: [],
  productoDetalle: null,

  loading: false,
  loadingDetalle: false,

  error: null,

  // ==========================
  // Setters
  // ==========================

  setProductos: (productos) =>
    set({ productos }),

  setProductoDetalle: (productoDetalle) =>
    set({ productoDetalle }),

  clearProductoDetalle: () =>
    set({ productoDetalle: null }),

  setLoading: (loading) =>
    set({ loading }),

  setLoadingDetalle: (loadingDetalle) =>
    set({ loadingDetalle }),

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
      error: null,
    }),
}))