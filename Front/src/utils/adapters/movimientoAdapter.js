/**
 * Adaptador para transformar los datos de Movimientos provenientes del Backend 
 * a la estructura requerida por el Frontend.
 */

export const adapterMovimientoListado = (data) => {
  if (!data) return []
  return data.map(item => ({
    id: item.id,
    productoId: item.producto_id,
    tipoMovimiento: item.tipo_movimiento,
    origen: item.origen,
    cantidad: item.cantidad,
    stockAnterior: item.stock_anterior,
    stockNuevo: item.stock_nuevo,
    documentoTipo: item.documento_tipo,
    documentoId: item.documento_id,
    observacion: item.observacion,
    usuarioId: item.usuario_id,
    fecha: item.created_at,
    // Datos extendidos que el backend podría enviar
    codigo: item.codigo || 'N/A',
    productoNombre: item.producto_nombre || 'N/A',
    marca: item.marca || 'N/A',
    tipoCalzado: item.tipo_calzado || 'N/A',
    material: item.material || 'N/A',
    color: item.color || 'N/A',
    talla: item.talla || 'N/A'
  }))
}

export const adapterMovimientoDetalle = (data) => {
  if (!data) return null
  return {
    ...adapterMovimientoListado([data])[0]
  }
}
