export const agruparProductosPlanos = (productosPlanos) => {
  const catalogoDict = {}
  for (const p of productosPlanos) {
    const grupoKey = `${p.codigo_producto_id}-${p.tipo_calzado?.id || ''}-${p.material?.id || ''}-${(p.descripcion || '').trim().toLowerCase()}`
    
    if (!catalogoDict[grupoKey]) {
      catalogoDict[grupoKey] = {
        grupo_id: p.id,
        producto_principal_id: p.id, // Mantenido por compatibilidad
        codigo_producto_id: p.codigo_producto_id, 
        codigo: p.codigo, 
        marca: p.marca,
        tipo_calzado: p.tipo_calzado, 
        material: p.material, 
        descripcion: p.descripcion, 
        colores: {}
      }
    }
    const color_id = p.color.id
    if (!catalogoDict[grupoKey].colores[color_id]) {
      catalogoDict[grupoKey].colores[color_id] = { 
        color_id: color_id, 
        color: p.color, 
        imagen_principal: p.imagen_principal, 
        variantes: [] 
      }
    } else if (p.imagen_principal && !catalogoDict[grupoKey].colores[color_id].imagen_principal) {
      catalogoDict[grupoKey].colores[color_id].imagen_principal = p.imagen_principal
    }
    catalogoDict[grupoKey].colores[color_id].variantes.push({
      id: p.id, 
      talla: p.talla, 
      stock_actual: p.stock_actual, 
      stock_minimo: p.stock_minimo,
      stock_maximo: p.stock_maximo, 
      precio_compra: p.precio_compra, 
      precio_venta: p.precio_venta, 
      estado: p.estado
    })
  }
  return Object.values(catalogoDict).map(cp => ({ ...cp, colores: Object.values(cp.colores) }))
}
