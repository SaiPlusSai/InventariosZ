import os
import glob

services = ['marca', 'talla', 'tipoCalzado', 'material', 'color']
endpoints = ['marcas', 'tallas', 'tipos', 'materiales', 'colores']

for s_name, ep in zip(services, endpoints):
    path = f"src/services/{s_name}Service.js"
    if not os.path.exists(path):
        continue
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    if "importarPrevia" in content:
        continue

    imports = f"""
const exportarExcel = () => axiosInstance.get('/{ep}/exportar/excel', {{ responseType: 'blob' }})
const descargarPlantilla = () => axiosInstance.get('/{ep}/importar/plantilla', {{ responseType: 'blob' }})
const importarPrevia = (formData) => axiosInstance.post('/{ep}/importar/previa', formData, {{ headers: {{ 'Content-Type': 'multipart/form-data' }} }})
const importarConfirmar = (data) => axiosInstance.post('/{ep}/importar/confirmar', data)

"""

    content = content.replace("import axiosInstance from './axios'\n", "import axiosInstance from './axios'\n" + imports)
    
    if "}\n\nexport default" in content:
        content = content.replace("}\n\nexport default", "  exportarExcel,\n  descargarPlantilla,\n  importarPrevia,\n  importarConfirmar\n}\n\nexport default")
    else:
        content = content.replace("\n}", ",\n  exportarExcel,\n  descargarPlantilla,\n  importarPrevia,\n  importarConfirmar\n}")
    
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
        
print("Services patched")
