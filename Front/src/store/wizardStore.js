import { create } from 'zustand'

export const useWizardStore = create((set) => ({
  currentStep: 1,
  formData: {
    codigo: '',
    marca_id: null,
    tipo_calzado_id: null,
    material_id: null,
    descripcion: '',
    colores: [],
    tallas: [],
    variantes: [],
    imagenes: [],
  },
  
  setCurrentStep: (step) => set({ currentStep: step }),
  
  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
  
  addVariante: (variante) =>
    set((state) => ({
      formData: {
        ...state.formData,
        variantes: [...state.formData.variantes, variante],
      },
    })),
  
  updateVariante: (index, variante) =>
    set((state) => ({
      formData: {
        ...state.formData,
        variantes: state.formData.variantes.map((v, i) =>
          i === index ? { ...v, ...variante } : v
        ),
      },
    })),
  
  addImagen: (imagen) =>
    set((state) => ({
      formData: {
        ...state.formData,
        imagenes: [...state.formData.imagenes, imagen],
      },
    })),
  
  removeImagen: (index) =>
    set((state) => ({
      formData: {
        ...state.formData,
        imagenes: state.formData.imagenes.filter((_, i) => i !== index),
      },
    })),
  
  resetWizard: () =>
    set({
      currentStep: 1,
      formData: {
        codigo: '',
        marca_id: null,
        descripcion: '',
        tipo_calzado_id: null,
        material_id: null,
        colores: [],
        tallas: [],
        variantes: [],
        imagenes: [],
      },
    }),
}))
