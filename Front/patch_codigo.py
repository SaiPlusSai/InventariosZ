import os

path = "src/pages/codigoProducto/index.jsx"
if os.path.exists(path):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    if "GenericImportarModal" not in content:
        # 1. Imports
        if "import { Loader2 } from 'lucide-react'" in content:
            content = content.replace("import { Loader2 } from 'lucide-react'", "import { Loader2, Download, UploadCloud } from 'lucide-react'\nimport GenericImportarModal from '../../components/ui/GenericImportarModal'")
        else:
            # find lucide
            import_lucide = [line for line in content.split('\n') if 'lucide-react' in line]
            if import_lucide:
                new_import = import_lucide[0].replace(" }", ", Download, UploadCloud }")
                content = content.replace(import_lucide[0], new_import + "\nimport GenericImportarModal from '../../components/ui/GenericImportarModal'")

        # 2. State
        content = content.replace("const [showDeleteModal, setShowDeleteModal] = useState(false)", "const [showImportModal, setShowImportModal] = useState(false)\n  const [showDeleteModal, setShowDeleteModal] = useState(false)")

        # 3. Export
        export_fn = """
  const handleExportarExcel = async () => {
    try {
      const loadingToast = toast.loading('Generando Excel...')
      const response = await codigoProductoService.exportarExcel()
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'codigos_producto_inventario.xlsx')
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      toast.dismiss(loadingToast)
      toast.success('Excel exportado correctamente')
    } catch (error) {
      toast.error('Error al exportar a Excel')
    }
  }

  const handleDeleteClick ="""
        content = content.replace("  const handleDeleteClick =", export_fn)

        # 4. Buttons
        buttons = """            <>
              <Button variant="secondary" onClick={() => setShowImportModal(true)}>
                <UploadCloud size={16} className="mr-2 inline" /> Importar
              </Button>
              <Button variant="secondary" onClick={handleExportarExcel}>
                <Download size={16} className="mr-2 inline" /> Exportar
              </Button>
              <Button variant="primary" onClick={() => handleOpenModal()}>"""
        content = content.replace("""          {!isPapeleraMode && (
            <Button variant="primary" onClick={() => handleOpenModal()}>""", f"          {{!isPapeleraMode && (\n{buttons}")
                
        content = content.replace("""            </Button>
          )}
        </div>
      </div>""", """            </Button>
            </>
          )}
        </div>
      </div>""")

        # 5. Modal
        modal = """
      {showImportModal && (
        <GenericImportarModal 
          title="Importación de Códigos de Producto"
          description="Añade múltiples códigos usando un archivo Excel. La columna 'Marca' debe coincidir con el nombre de una marca existente."
          onClose={() => setShowImportModal(false)}
          onImportSuccess={() => {
            setShowImportModal(false)
            loadData()
          }}
          descargarPlantillaFn={codigoProductoService.descargarPlantilla}
          importarPreviaFn={codigoProductoService.importarPrevia}
          importarConfirmarFn={codigoProductoService.importarConfirmar}
        />
      )}
    </div>
  )
}"""
        content = content.replace("""    </div>
  )
}""", modal)

        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print("Patched CodigoProducto")
else:
    print("File not found")
