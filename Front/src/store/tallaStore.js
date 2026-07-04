import { create } from 'zustand'

export const useTallaStore = create((set) => ({
  tallas: [],
  loading: false,
  error: null,
  
  setTallas: (tallas) => set({ tallas }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  addTalla: (talla) =>
    set((state) => ({
      tallas: [...state.tallas, talla],
    })),
  
  updateTalla: (id, updatedTalla) =>
    set((state) => ({
      tallas: state.tallas.map((t) =>
        t.id === id ? { ...t, ...updatedTalla } : t
      ),
    })),
  
  deleteTalla: (id) =>
    set((state) => ({
      tallas: state.tallas.filter((t) => t.id !== id),
    })),
}))
