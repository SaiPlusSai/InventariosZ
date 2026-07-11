import os

pages = [
    ('tallas', 'Tallas', 'talla', 'loadTallas'),
    ('tipos', 'Tipos', 'tipoCalzado', 'loadTipos'),
    ('materiales', 'Materiales', 'material', 'loadMateriales'),
    ('colores', 'Colores', 'color', 'loadColores')
]

for folder, title, s_name, load_fn in pages:
    path = f"src/pages/{folder}/index.jsx"
    if not os.path.exists(path): continue
    
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
        
    if "GenericImportarModal" in content: continue
    
    # 1. Imports
    content = content.replace("import { Loader2 } from 'lucide-react'", "import { Loader2, Download, UploadCloud } from 'lucide-react'\nimport GenericImportarModal from '../../components/ui/GenericImportarModal'")
    if "import { Loader2 } from 'lucide-react'" not in content and "Download, UploadCloud" not in content:
        # try to find lucide-react import
        import_lucide = [line for line in content.split('\\n') if 'lucide-react' in line]
        if import_lucide:
            new_import = import_lucide[0].replace(" }", ", Download, UploadCloud }")
            content = content.replace(import_lucide[0], new_import + "\\nimport GenericImportarModal from '../../components/ui/GenericImportarModal'")
    
    # 2. State
    content = content.replace("const [showDeleteModal, setShowDeleteModal] = useState(false)", "const [showImportModal, setShowImportModal] = useState(false)\n  const [showDeleteModal, setShowDeleteModal] = useState(false)")
    
    # 3. handleExportarExcel
    export_fn = f"""
  const handleExportarExcel = async () => {{
    try {{
      const loadingToast = toast.loading('Generando Excel...')
      const response = await {s_name}Service.exportarExcel()
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', '{folder}_inventario.xlsx')
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      toast.dismiss(loadingToast)
      toast.success('Excel exportado correctamente')
    }} catch (error) {{
      toast.error('Error al exportar a Excel')
    }}
  }}

  const handleDeleteClick ="""
    content = content.replace("  const handleDeleteClick =", export_fn)
    
    # 4. Buttons
    buttons = f"""            <>
              <Button variant="secondary" onClick={{() => setShowImportModal(true)}}>
                <UploadCloud size={{16}} className="mr-2 inline" /> Importar
              </Button>
              <Button variant="secondary" onClick={{handleExportarExcel}}>
                <Download size={{16}} className="mr-2 inline" /> Exportar
              </Button>
              <Button variant="primary" onClick={{() => handleOpenModal()}}>"""
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
    modal = f"""
      {{showImportModal && (
        <GenericImportarModal 
          title="Importación de {title}"
          description="Añade múltiples registros usando un archivo Excel"
          onClose={{() => setShowImportModal(false)}}
          onImportSuccess={{() => {{
            setShowImportModal(false)
            {load_fn}()
          }}}}
          descargarPlantillaFn={{{s_name}Service.descargarPlantilla}}
          importarPreviaFn={{{s_name}Service.importarPrevia}}
          importarConfirmarFn={{{s_name}Service.importarConfirmar}}
        />
      )}}
    </div>
  )
}}"""
    content = content.replace("""    </div>
  )
}""", modal)

    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
        
print("Pages patched")
