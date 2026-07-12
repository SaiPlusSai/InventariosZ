import React, { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, X, Loader2, Download , FileDown, FileUp} from 'lucide-react'
import Button from './Button'
import toast from 'react-hot-toast'

const GenericImportarModal = ({ 
  title = "Importación Masiva", 
  description = "Añade múltiples registros usando Excel", 
  onClose, 
  onImportSuccess,
  descargarPlantillaFn,
  importarPreviaFn,
  importarConfirmarFn
}) => {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [previaData, setPreviaData] = useState(null)
  const fileInputRef = useRef(null)

  const handleDescargarPlantilla = async () => {
    try {
      const loadingToast = toast.loading('Generando plantilla...');
      const response = await descargarPlantillaFn();
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'plantilla.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      toast.dismiss(loadingToast);
      toast.success('Plantilla descargada');
    } catch (error) {
      toast.dismiss();
      toast.error('Error al descargar plantilla');
    }
  }

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      
      setLoading(true)
      try {
        const formData = new FormData()
        formData.append('file', selectedFile)
        const response = await importarPreviaFn(formData)
        setPreviaData(response.data)
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Error al procesar el archivo')
        setFile(null)
        setPreviaData(null)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleConfirmar = async () => {
    if (!previaData || previaData.validos === 0) return
    
    setLoading(true)
    try {
      const res = await importarConfirmarFn({ filas: previaData.filas })
      toast.success(`Se importaron ${res.data.creados} registros correctamente`)
      onImportSuccess()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al importar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto bg-gray-50/50">
          
          {!previaData && !loading && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-4 items-start">
                <FileText className="text-blue-500 shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900">Paso 1: Descarga la plantilla</h3>
                  <p className="text-sm text-blue-700 mt-1 mb-3">Utiliza nuestra plantilla oficial para asegurarte de que los datos tengan el formato correcto.</p>
                  <Button variant="secondary" onClick={handleDescargarPlantilla} className="bg-white border-blue-200 hover:bg-blue-50">
                    <Download size={16} className="mr-2 inline" /> Descargar Plantilla Excel
                  </Button>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <FileDown size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="font-medium text-gray-900 mb-1">Paso 2: Sube tu archivo</h3>
                <p className="text-sm text-gray-500 mb-4">Selecciona el archivo Excel completado (.xlsx)</p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept=".xlsx, .xls"
                  onChange={handleFileChange}
                />
                <Button onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} variant="primary">
                  Seleccionar Archivo
                </Button>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Procesando archivo...</p>
            </div>
          )}

          {previaData && !loading && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm text-center">
                  <div className="text-2xl font-bold text-gray-800">{previaData.total}</div>
                  <div className="text-sm text-gray-500">Filas Leídas</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow-sm text-center">
                  <div className="text-2xl font-bold text-green-600">{previaData.validos}</div>
                  <div className="text-sm text-green-700">Listos para Importar</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200 shadow-sm text-center">
                  <div className="text-2xl font-bold text-red-600">{previaData.errores}</div>
                  <div className="text-sm text-red-700">Con Errores</div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-[300px]">
                  <table className="w-full text-sm text-left min-w-[500px] whitespace-nowrap">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3">Fila</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3">Nombre</th>
                        <th className="px-4 py-3">Detalle Errores</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previaData.filas.map((f, i) => (
                        <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium text-gray-900">{f.fila}</td>
                          <td className="px-4 py-2">
                            {f.valido ? 
                              <span className="flex items-center text-green-600"><CheckCircle size={14} className="mr-1"/> Válido</span> :
                              <span className="flex items-center text-red-600"><AlertCircle size={14} className="mr-1"/> Error</span>
                            }
                          </td>
                          <td className="px-4 py-2 text-gray-900 font-medium">{f.nombre || '-'}</td>
                          <td className="px-4 py-2 text-red-600">{f.errores.join(' • ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          {previaData && !loading && (
            <Button variant="primary" onClick={handleConfirmar} disabled={previaData.validos === 0}>
              <FileDown size={16} className="mr-2 inline" /> Importar {previaData.validos} Válidos
            </Button>
          )}
        </div>

      </div>
    </div>
  )
}

export default GenericImportarModal
