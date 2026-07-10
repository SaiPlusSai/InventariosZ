import os
import re

directories = ['Front/src/pages/colores', 'Front/src/pages/materiales', 'Front/src/pages/tallas', 'Front/src/pages/tipos', 'Front/src/pages/codigoProducto']

for dir_path in directories:
    file_path = os.path.join(dir_path, 'index.jsx')
    if not os.path.exists(file_path):
        continue
        
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Update imports
    content = content.replace('import DeleteConfirmationModal from \'../../components/ui/DeleteConfirmationModal\'', 'import { ConfirmModal, EmptyState } from \'../../components/ui\'')
    if 'import toast' not in content:
        content = content.replace('import { useRecoveryManager } from \'../../hooks/useRecoveryManager\'', 'import { useRecoveryManager } from \'../../hooks/useRecoveryManager\'\nimport toast from \'react-hot-toast\'\nimport { Loader2 } from \'lucide-react\'')
    
    # 2. Update Toasts on create/update
    if 'toast.success' not in content:
        content = re.sub(r'(await [a-zA-Z]+Service\.update\(.*?\))', r'\1\n        toast.success(\'Registro actualizado correctamente\')', content)
        content = re.sub(r'(await [a-zA-Z]+Service\.create\(.*?\))', r'\1\n        toast.success(\'Registro creado correctamente\')', content)
        # Update Toasts on recuperar
        content = re.sub(r'(await [a-zA-Z]+Service\.recuperar\(.*?\))', r'\1\n      toast.success(\'Registro recuperado correctamente\')', content)
    
    # 3. Update EmptyState
    # ) : [a-zA-Z]+.length === 0 ? (
    #   <p className="text-gray-500">No hay [a-zA-Z]+ registrad[a-z]+</p>
    content = re.sub(r'\) : ([a-zA-Z]+)\.length === 0 \? \(\s*<p className="text-gray-500">.*?</p>', r') : \1.length === 0 ? (\n          <EmptyState \n            title={isPapeleraMode ? "Papelera vacía" : "No hay registros"}\n            description={isPapeleraMode ? "No hay registros eliminados." : "Crea el primer registro para comenzar."}\n            actionLabel={!isPapeleraMode ? "Nuevo Registro" : undefined}\n            onAction={!isPapeleraMode ? () => handleOpenModal() : undefined}\n          />', content)
    
    # 4. Update Button loading
    # <Button variant="primary" onClick={handleSave} disabled={saving}>
    #   {saving ? 'Guardando...' : 'Guardar'}
    # </Button>
    content = re.sub(
        r'<Button variant="primary" onClick=\{handleSave\} disabled=\{saving\}>\s*\{saving \? \'Guardando\.\.\.\' : \'Guardar\'\}\s*</Button>',
        r'<Button variant="primary" onClick={handleSave} disabled={saving} className="min-w-[100px]">\n                {saving ? (\n                  <div className="flex items-center gap-2">\n                    <Loader2 className="w-4 h-4 animate-spin" />\n                    <span>Guardando</span>\n                  </div>\n                ) : \'Guardar\'}\n              </Button>',
        content
    )
    
    # 5. Replace DeleteConfirmationModal with ConfirmModal
    delete_modal_regex = re.compile(r'<DeleteConfirmationModal\s+isOpen=\{showDeleteModal\}.*?isPhysicalDelete=\{isPapeleraMode\}\s*/>', re.DOTALL)
    
    service_match = re.search(r'service=\{([a-zA-Z]+Service)\}', content)
    service_name = service_match.group(1) if service_match else 'unknownService'
    
    replacement_modal = f'''<ConfirmModal
        isOpen={{showDeleteModal}}
        onClose={{() => {{ setShowDeleteModal(false); setItemToDelete(null); }}}}
        onConfirm={{async () => {{
          if (isPapeleraMode) {{
            await {service_name}.delete(itemToDelete.id)
            toast.success('Registro eliminado permanentemente')
          }} else {{
            await {service_name}.desactivar(itemToDelete.id)
            toast.success('Registro enviado a la papelera')
          }}
          loadData()
          setShowDeleteModal(false)
          setItemToDelete(null)
        }}}}
        title={{isPapeleraMode ? 'Eliminar Permanentemente' : 'Eliminar Registro'}}
        message={{`¿Está seguro de ${{isPapeleraMode ? 'eliminar permanentemente' : 'eliminar'}} el registro "${{itemToDelete?.nombre || itemToDelete?.codigo}}"?`}}
        confirmText={{isPapeleraMode ? 'Eliminar Definitivamente' : 'Enviar a Papelera'}}
        variant="danger"
        dependencyConfig={{{{
          service: {service_name},
          itemId: itemToDelete?.id,
          isPhysicalDelete: isPapeleraMode
        }}}}
      />'''
      
    content = delete_modal_regex.sub(replacement_modal, content)
    
    load_func_match = re.search(r'const (load[A-Z][a-zA-Z]+) = async', content)
    if load_func_match:
        load_func_name = load_func_match.group(1)
        content = content.replace('loadData()', load_func_name + '()')
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f'Updated {{file_path}}')
