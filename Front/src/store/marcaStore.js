import { create } from 'zustand'

export const useMarcaStore = create((set) => ({
  marcas: [],
  loading: false,
  error: null,
  
  setMarcas: (marcas) => set({ marcas }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  addMarca: (marca) =>
    set((state) => ({
      marcas: [...state.marcas, marca],
    })),
  
  updateMarca: (id, updatedMarca) =>
    set((state) => ({
      marcas: state.marcas.map((m) =>
        m.id === id ? { ...m, ...updatedMarca } : m
      ),
    })),
  
  deleteMarca: (id) =>
    set((state) => ({
      marcas: state.marcas.filter((m) => m.id !== id),
    })),
}))
