import { create } from 'zustand'

export const useColorStore = create((set) => ({
  colores: [],
  loading: false,
  error: null,
  
  setColores: (colores) => set({ colores }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  addColor: (color) =>
    set((state) => ({
      colores: [...state.colores, color],
    })),
  
  updateColor: (id, updatedColor) =>
    set((state) => ({
      colores: state.colores.map((c) =>
        c.id === id ? { ...c, ...updatedColor } : c
      ),
    })),
  
  deleteColor: (id) =>
    set((state) => ({
      colores: state.colores.filter((c) => c.id !== id),
    })),
}))
