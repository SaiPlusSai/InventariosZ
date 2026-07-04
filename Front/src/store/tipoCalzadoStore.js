import { create } from 'zustand'

export const useTipoCalzadoStore = create((set) => ({
  tipos: [],
  loading: false,
  error: null,
  
  setTipos: (tipos) => set({ tipos }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  addTipo: (tipo) =>
    set((state) => ({
      tipos: [...state.tipos, tipo],
    })),
  
  updateTipo: (id, updatedTipo) =>
    set((state) => ({
      tipos: state.tipos.map((t) =>
        t.id === id ? { ...t, ...updatedTipo } : t
      ),
    })),
  
  deleteTipo: (id) =>
    set((state) => ({
      tipos: state.tipos.filter((t) => t.id !== id),
    })),
}))
