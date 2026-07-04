import { useWizardStore } from '../../../store/wizardStore'
import { useColorStore } from '../../../store/colorStore'
import { useTallaStore } from '../../../store/tallaStore'
import { useMarcaStore } from '../../../store/marcaStore'
import { useTipoCalzadoStore } from '../../../store/tipoCalzadoStore'
import { useMaterialStore } from '../../../store/materialStore'
import { formatCurrency } from '../../../utils/helpers'

export default function Step6Resumen() {
  const { formData } = useWizardStore()
  const { marcas } = useMarcaStore()
  const { tipos } = useTipoCalzadoStore()
  const { materiales } = useMaterialStore()
  const { colores } = useColorStore()
  const { tallas } = useTallaStore()

  const marca = marcas.find((m) => m.id === formData.marca_id)
  const tipo = tipos.find((t) => t.id === formData.tipo_calzado_id)
  const material = materiales.find((m) => m.id === formData.material_id)

  const totalStock = formData.variantes.reduce(
    (sum, v) => sum + (v.stock_actual || 0),
    0
  )
  const precioPromedio =
    formData.variantes.length > 0
      ? formData.variantes.reduce((sum, v) => sum + (v.precio_venta || 0), 0) /
        formData.variantes.length
      : 0

  return (
    <div className="space-y-6">
      {/* Información General */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-3">Información General</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Código:</span>
            <p className="font-medium">{formData.codigo}</p>
          </div>
          <div>
            <span className="text-gray-600">Marca:</span>
            <p className="font-medium">{marca?.nombre}</p>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">Descripción:</span>
            <p className="font-medium">{formData.descripcion}</p>
          </div>
          <div>
            <span className="text-gray-600">Tipo:</span>
            <p className="font-medium">{tipo?.nombre}</p>
          </div>
          <div>
            <span className="text-gray-600">Material:</span>
            <p className="font-medium">{material?.nombre}</p>
          </div>
        </div>
      </div>

      {/* Colores y Tallas */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-3">Colores y Tallas</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Colores:</span>
            <p className="font-medium">
              {colores
                .filter((c) => formData.colores.includes(c.id))
                .map((c) => c.nombre)
                .join(', ')}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Tallas:</span>
            <p className="font-medium">
              {tallas
                .filter((t) => formData.tallas.includes(t.id))
                .map((t) => t.numero)
                .join(', ')}
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-sm">Variantes</p>
          <p className="text-2xl font-bold text-primary-600">
            {formData.variantes.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-sm">Stock Total</p>
          <p className="text-2xl font-bold text-green-600">{totalStock}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-sm">Precio Promedio</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(precioPromedio)}
          </p>
        </div>
      </div>

      {/* Tabla de Variantes */}
      <div>
        <h3 className="font-semibold mb-3">Variantes</h3>
        <div className="overflow-x-auto max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left">Color</th>
                <th className="px-4 py-2 text-left">Talla</th>
                <th className="px-4 py-2 text-center">Stock</th>
                <th className="px-4 py-2 text-right">Precio Venta</th>
              </tr>
            </thead>
            <tbody>
              {formData.variantes.map((variante, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">
                    {colores.find((c) => c.id === variante.color_id)?.nombre}
                  </td>
                  <td className="px-4 py-2">
                    {tallas.find((t) => t.id === variante.talla_id)?.nombre}
                  </td>
                  <td className="px-4 py-2 text-center">{variante.stock_actual}</td>
                  <td className="px-4 py-2 text-right">
                    {formatCurrency(variante.precio_venta)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Imágenes */}
      {formData.imagenes.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Imágenes</h3>
          <div className="grid grid-cols-4 gap-3">
            {formData.imagenes.map((img, idx) => (
              <div key={idx} className="relative">
                <img
                  src={img.datos_base64}
                  alt="Producto"
                  className={`w-full h-24 object-cover rounded-lg border ${
                    img.es_principal ? 'border-primary-600 border-2' : 'border-gray-300'
                  }`}
                />
                {img.es_principal && (
                  <div className="absolute top-1 right-1 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                    Principal
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
        ✓ Todo listo. Haz clic en "Guardar Producto" para completar el registro.
      </div>
    </div>
  )
}
