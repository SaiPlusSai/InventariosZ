import { create } from 'zustand'

const initialFormData = {
  codigo: '',
  marca_id: null,
  tipo_calzado_id: null,
  material_id: null,
  descripcion: '',
  colores: [],
  tallas: [],
  variantes: [],
  imagenes: [],
}

export const useWizardStore = create((set) => ({
  // ==========================
  // Estado
  // ==========================

  modo: 'crear',

  codigoProductoId: null,

  currentStep: 1,

  formData: initialFormData,

  // ==========================
  // Navegación
  // ==========================

  setCurrentStep: (step) =>
    set({ currentStep: step }),

  setModo: (modo) =>
    set({ modo }),

  setCodigoProductoId: (codigoProductoId) =>
    set({ codigoProductoId }),

  // ==========================
  // Formulario
  // ==========================

  setFormData: (data) =>
    set((state) => ({
      formData: {
        ...state.formData,
        ...data,
      },
    })),

  cargarProductoEditar: (data) =>
    set({
      modo: 'editar',
      codigoProductoId: data.codigo_producto_id,
      currentStep: 1,
      formData: {
        codigo: data.codigo,
        marca_id: data.marca_id,
        tipo_calzado_id: data.tipo_calzado_id,
        material_id: data.material_id,
        descripcion: data.descripcion,

        colores: [
          ...new Set(
            data.variantes.map(
              (v) => v.color_id
            )
          ),
        ],

        tallas: [
          ...new Set(
            data.variantes.map(
              (v) => v.talla_id
            )
          ),
        ],

        variantes: data.variantes,

        imagenes: data.imagenes,
      },
    }),

  // ==========================
  // Variantes
  // ==========================

  addVariante: (variante) =>
    set((state) => ({
      formData: {
        ...state.formData,
        variantes: [
          ...state.formData.variantes,
          variante,
        ],
      },
    })),

  updateVariante: (index, variante) =>
    set((state) => ({
      formData: {
        ...state.formData,
        variantes:
          state.formData.variantes.map(
            (v, i) =>
              i === index
                ? {
                    ...v,
                    ...variante,
                  }
                : v
          ),
      },
    })),

  // ==========================
  // Imágenes
  // ==========================

  addImagen: (imagen) =>
    set((state) => ({
      formData: {
        ...state.formData,
        imagenes: [
          ...state.formData.imagenes,
          imagen,
        ],
      },
    })),

  removeImagen: (index) =>
    set((state) => ({
      formData: {
        ...state.formData,
        imagenes:
          state.formData.imagenes.filter(
            (_, i) => i !== index
          ),
      },
    })),

  // ==========================
  // Reiniciar
  // ==========================

  resetWizard: () =>
    set({
      modo: 'crear',
      codigoProductoId: null,
      currentStep: 1,
      formData: {
        ...initialFormData,
      },
    }),
}))