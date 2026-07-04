import { create } from 'zustand'

export const useMaterialStore = create((set) => ({
  materiales: [],
  loading: false,
  error: null,
  
  setMateriales: (materiales) => set({ materiales }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  addMaterial: (material) =>
    set((state) => ({
      materiales: [...state.materiales, material],
    })),
  
  updateMaterial: (id, updatedMaterial) =>
    set((state) => ({
      materiales: state.materiales.map((m) =>
        m.id === id ? { ...m, ...updatedMaterial } : m
      ),
    })),
  
  deleteMaterial: (id) =>
    set((state) => ({
      materiales: state.materiales.filter((m) => m.id !== id),
    })),
}))
