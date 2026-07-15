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
  targetColorId: null,

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
    set((state) => {
      console.group('🛠️ [wizardStore] setFormData');
      console.log('⬅️ Estado anterior completo:', state.formData);
      console.log('📦 Datos recibidos:', data);
      
      const nextFormData = {
        ...state.formData,
        ...data,
      };
      
      console.log('➡️ Estado resultante:', nextFormData);
      console.table([{
        codigo: nextFormData.codigo,
        descripcion: nextFormData.descripcion,
        marca_id: nextFormData.marca_id,
        tipo_calzado_id: nextFormData.tipo_calzado_id,
        material_id: nextFormData.material_id
      }]);
      console.groupEnd();

      return { formData: nextFormData };
    }),

  cargarProductoEditarCompleto: async (codigoProductoId, targetColorId = null) => {
    console.group('🚀 [wizardStore] cargarProductoEditarCompleto');
    console.log('⏱️ Inicio de ejecución:', new Date().toISOString());
    console.log('🔑 codigoProductoId:', codigoProductoId);
    console.log('🎨 targetColorId:', targetColorId);

    try {
      const res = await productoService.getEditarCompleto(codigoProductoId)
      console.log('📥 Respuesta completa del backend:', res);
      
      const data = res.data

      console.table([{
        codigo: data.codigo,
        descripcion: data.descripcion,
        marca_id: data.marca_id,
        tipo_calzado_id: data.tipo_calzado_id,
        material_id: data.material_id
      }]);

      let variantes = data.variantes
      console.log('🔀 Variantes recibidas:', variantes);

      if (targetColorId) {
        variantes = variantes.filter((v) => v.color_id === targetColorId)
      }
      console.log('🔀 Variantes luego del filtro:', variantes);

      const colores = [...new Set(variantes.map((v) => v.color_id))]
      const tallas = [...new Set(variantes.map((v) => v.talla_id))]

      console.log('🎨 Colores detectados:', colores);
      console.log('📏 Tallas detectadas:', tallas);

      const imagenesPorColor = {}
      
      for (const color_id of colores) {
        const firstVariant = variantes.find(v => v.color_id === color_id)
        if (firstVariant) {
          try {
            console.log(`🖼️ Petición de imágenes para color_id: ${color_id}, variante id: ${firstVariant.id}`);
            const imgRes = await productoImagenService.getByProductoId(firstVariant.id)
            console.log(`✅ Respuesta de imágenes para color_id ${color_id}:`, imgRes);
            
            imagenesPorColor[color_id] = imgRes.data.map(img => ({
              ...img,
              datos_base64: img.ruta,
            }))
          } catch (error) {
            console.error(`❌ Error en petición de imágenes para color_id ${color_id}:`, error);
            imagenesPorColor[color_id] = []
          }
        }
      }

      const nextFormData = {
        codigo: data.codigo,
        marca_id: data.marca_id,
        tipo_calzado_id: data.tipo_calzado_id,
        material_id: data.material_id,
        descripcion: data.descripcion,
        colores,
        tallas,
        variantes: variantes,
        imagenesPorColor,
      };

      console.log('📤 FormData que será enviado al store:', nextFormData);

      set((state) => {
        console.log('⬅️ Estado completo ANTES del set():', state);
        
        const nextState = {
          modo: 'editar',
          codigoProductoId: data.codigo_producto_id,
          targetColorId: targetColorId,
          currentStep: 1,
          formData: nextFormData,
        };

        console.log('➡️ Estado completo DESPUÉS del set():', { ...state, ...nextState });
        return nextState;
      });

      console.groupEnd();
    } catch (error) {
      console.error("❌ Cualquier excepción en cargarProductoEditarCompleto:", error)
      console.groupEnd();
    }
  },

<<<<<<< HEAD
<<<<<<< HEAD

=======
>>>>>>> a9ce3388e0fb2c474b54093eb04261c8fbe6f819
=======
>>>>>>> a9ce3388e0fb2c474b54093eb04261c8fbe6f819
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
      targetColorId: null,
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
        imagenesPorColor: {},
      },
    }),
}))