import os, glob, re

files = glob.glob('src/pages/*/index.jsx') + ['src/components/ui/GenericImportarModal.jsx', 'src/pages/productos/ImportarModal.jsx']

for path in files:
    if not os.path.exists(path): continue
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Imports
    import_match = re.search(r'import\s+\{([^}]+)\}\s+from\s+[\'\"]lucide-react[\'\"]', content)
    if import_match:
        imports = import_match.group(1)
        new_imports = imports
        if 'FileDown' not in new_imports: new_imports += ', FileDown'
        if 'FileUp' not in new_imports: new_imports += ', FileUp'
        content = content.replace(imports, new_imports)
    
    # Replace Upload with FileDown (for Importar)
    content = content.replace('<Upload ', '<FileDown ')
    
    # Replace Download with FileUp (for Exportar)
    content = content.replace('<Download size={16} className=\"mr-2 inline\"/> Exportar', '<FileUp size={16} className=\"mr-2 inline\"/> Exportar')
    content = content.replace('<Download size={16} className=\"mr-2 inline\" /> Exportar', '<FileUp size={16} className=\"mr-2 inline\" /> Exportar')
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Processed', path)