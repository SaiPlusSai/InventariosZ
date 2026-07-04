import { create } from 'zustand'

export const useProductoStore = create((set) => ({
  productos: [],
  loading: false,
  error: null,
  
  setProductos: (productos) => set({ productos }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  addProducto: (producto) =>
    set((state) => ({
      productos: [...state.productos, producto],
    })),
  
  updateProducto: (id, updatedProducto) =>
    set((state) => ({
      productos: state.productos.map((p) =>
        p.id === id ? { ...p, ...updatedProducto } : p
      ),
    })),
  
  deleteProducto: (id) =>
    set((state) => ({
      productos: state.productos.filter((p) => p.id !== id),
    })),
  
  clearProductos: () => set({ productos: [], error: null }),
}))
