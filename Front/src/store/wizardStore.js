import { create } from 'zustand'

import { productoService } from '../services/productoService'
import { productoImagenService } from '../services/productoImagenService'

const initialFormData = {
  codigo: '',
  marca_id: null,
  tipo_calzado_id: null,
  material_id: null,
  descripcion: '',
  colores: [],
  tallas: [],
  variantes: [],
  imagenesPorColor: {},
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

  cargarProductoEditarCompleto: async (codigoProductoId) => {
    try {
      const res = await productoService.getEditarCompleto(codigoProductoId)
      const data = res.data

      const colores = [...new Set(data.variantes.map((v) => v.color_id))]
      const tallas = [...new Set(data.variantes.map((v) => v.talla_id))]

      const imagenesPorColor = {}
      
      for (const color_id of colores) {
        const firstVariant = data.variantes.find(v => v.color_id === color_id)
        if (firstVariant) {
          try {
            const imgRes = await productoImagenService.getByProductoId(firstVariant.id)
            imagenesPorColor[color_id] = imgRes.data.map(img => ({
              ...img,
              datos_base64: img.ruta,
            }))
          } catch (error) {
            imagenesPorColor[color_id] = []
          }
        }
      }

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
          colores,
          tallas,
          variantes: data.variantes,
          imagenesPorColor,
        },
      })
    } catch (error) {
      console.error("Error al cargar para edicion:", error)
    }
  },

  resetWizard: () => set({ currentStep: 1, formData: initialFormData, modo: 'crear', codigoProductoId: null }),

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