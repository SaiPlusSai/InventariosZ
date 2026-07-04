import { useState } from 'react'
import { useWizardStore } from '../../../store/wizardStore'
import { Button } from '../../../components/ui'

export default function Step5Imagenes() {
  const { formData, setFormData } = useWizardStore()
  const [preview, setPreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreview(event.target.result)
        setSelectedFile({
          file,
          data: event.target.result,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddImagen = () => {
    if (selectedFile) {
      const nuevoOrden = formData.imagenes.filter(i => !i.es_principal).length + 1
      const nuevaImagen = {
        bucket: 'local',
        ruta: `imagenes/${Date.now()}-${selectedFile.file.name}`,
        nombre_archivo: selectedFile.file.name,
        es_principal: formData.imagenes.length === 0, // Primera es principal
        orden: formData.imagenes.length === 0 ? 1 : nuevoOrden,
        // Mantener datos Base64 temporalmente para envío
        datos_base64: selectedFile.data,
      }
      setFormData({
        imagenes: [...formData.imagenes, nuevaImagen],
      })
      setPreview(null)
      setSelectedFile(null)
    }
  }

  const handleRemoveImagen = (index) => {
    const nuevasImagenes = formData.imagenes.filter((_, i) => i !== index)
    // Reordenar: primera es principal
    if (nuevasImagenes.length > 0) {
      nuevasImagenes[0].es_principal = true
      nuevasImagenes[0].orden = 1
      nuevasImagenes.forEach((img, idx) => {
        if (idx > 0) {
          img.es_principal = false
          img.orden = idx + 1
        }
      })
    }
    setFormData({ imagenes: nuevasImagenes })
  }

  const handleAddAdditional = (e) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          const nuevoOrden = formData.imagenes.filter(i => !i.es_principal).length + 1
          const nuevaImagen = {
            bucket: 'local',
            ruta: `imagenes/${Date.now()}-${file.name}`,
            nombre_archivo: file.name,
            es_principal: formData.imagenes.length === 0,
            orden: formData.imagenes.length === 0 ? 1 : nuevoOrden,
            datos_base64: event.target.result,
          }
          setFormData({
            imagenes: [...formData.imagenes, nuevaImagen],
          })
        }
        reader.readAsDataURL(file)
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Imagen Principal */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Imagen Principal</h3>
        {formData.imagenes.length > 0 && formData.imagenes[0].es_principal ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <img
                src={formData.imagenes[0].datos_base64}
                alt="Principal"
                className="w-32 h-32 object-cover rounded-lg border-2 border-primary-600"
              />
              <div>
                <p className="font-medium">{formData.imagenes[0].nombre_archivo}</p>
                <p className="text-sm text-gray-500">Imagen principal</p>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemoveImagen(0)}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            {preview ? (
              <div className="flex flex-col items-center gap-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-40 h-40 object-cover rounded-lg"
                />
                <Button
                  variant="primary"
                  onClick={handleAddImagen}
                >
                  Usar como imagen principal
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center cursor-pointer">
                <span className="text-4xl mb-2">📷</span>
                <span className="font-medium text-gray-700">
                  Sube la imagen principal
                </span>
                <span className="text-sm text-gray-500">
                  o arrastra y suelta
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        )}
      </div>

      {/* Imágenes Adicionales */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Imágenes Adicionales</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {formData.imagenes
            .filter((_, idx) => idx !== 0)
            .map((img, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={img.datos_base64}
                  alt={img.nombre_archivo}
                  className="w-full h-32 object-cover rounded-lg border border-gray-300"
                />
                <button
                  onClick={() => handleRemoveImagen(idx + 1)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
        </div>

        <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-primary-500 transition-colors">
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-2">🖼️</span>
            <span className="font-medium text-gray-700">
              Añade más imágenes
            </span>
            <span className="text-sm text-gray-500">
            </span>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleAddAdditional}
            multiple
            className="hidden"
          />
        </label>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
        {formData.imagenes.length > 0
          ? `✓ ${formData.imagenes.length} imagen${formData.imagenes.length !== 1 ? 'es' : ''} añadida${formData.imagenes.length !== 1 ? 's' : ''}`
          : 'Recomendamos añadir al menos una imagen principal'}
      </div>
    </div>
  )
}
