import glob
import re

for path in glob.glob('src/pages/*/index.jsx'):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    changed = False
    
    # 1. Tallas and Tipos etc:
    # talla.nombre.toLowerCase().includes(appliedSearch.t<div...
    if 'includes(appliedSearch.t<div' in content:
        content = content.replace('includes(appliedSearch.t<div', 'includes(appliedSearch.toLowerCase()))\n\n  return (\n    <div>\n      <div')
        changed = True

    # 2. CodigoProducto
    # marcaNombre.in<div
    if 'marcaNombre.in<div' in content:
        content = content.replace('marcaNombre.in<div', 'marcaNombre.includes(term))\n\n  return (\n    <div>\n      <div')
        changed = True
        
    # 3. Marcas, Materiales, Colores (maybe others):
    # .includes(appliedSearch.toL<div
    if 'includes(appliedSearch.toL<div' in content:
        content = content.replace('includes(appliedSearch.toL<div', 'includes(appliedSearch.toLowerCase()))\n\n  return (\n    <div>\n      <div')
        changed = True

    # 4. Another generic fallback:
    if 'includes(appliedSearch.toLo<div' in content:
        content = content.replace('includes(appliedSearch.toLo<div', 'includes(appliedSearch.toLowerCase()))\n\n  return (\n    <div>\n      <div')
        changed = True

    # Let's use regex for `.toLowerCase().includes(appliedSearch.to[a-z]*<div`
    content, count1 = re.subn(r'includes\(appliedSearch\.t[a-zA-Z]*<div', r'includes(appliedSearch.toLowerCase()))\n  )\n\n  return (\n    <div>\n      <div', content)
    if count1 > 0: changed = True

    content, count2 = re.subn(r'marcaNombre\.in[a-zA-Z]*<div', r'marcaNombre.includes(term))\n\n  return (\n    <div>\n      <div', content)
    if count2 > 0: changed = True

    if changed:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Repaired {path}")
