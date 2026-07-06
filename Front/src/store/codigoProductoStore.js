import { create } from 'zustand'

export const useCodigoProductoStore = create((set) => ({
  codigos: [],
  loading: false,
  error: null,
  
  setCodigos: (codigos) => set({ codigos }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  addCodigo: (codigo) =>
    set((state) => ({
      codigos: [...state.codigos, codigo],
    })),
  
  updateCodigo: (id, updatedCodigo) =>
    set((state) => ({
      codigos: state.codigos.map((c) =>
        c.id === id ? { ...c, ...updatedCodigo } : c
      ),
    })),
  
  deleteCodigo: (id) =>
    set((state) => ({
      codigos: state.codigos.filter((c) => c.id !== id),
    })),
}))
