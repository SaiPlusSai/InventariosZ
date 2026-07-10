/**
 * Formatea la información de un producto para ser compartida en texto plano,
 * sin emojis según el requerimiento.
 *
 * @param {Object} producto - Datos generales del producto (ej: marca, tipo, material).
 * @param {Object} colorInfo - Información de la variante de color y sus tallas/precios.
 * @returns {string} - Texto formateado listo para compartir.
 */
export const formatProductShareText = (producto, colorInfo) => {
  // Extraemos la información básica
  const marca = producto?.marca?.nombre || producto?.marca || 'N/A';
  const tipo = producto?.tipo_calzado?.nombre || producto?.tipo_calzado || 'N/A';
  const material = producto?.material?.nombre || producto?.material || 'N/A';
  const color = colorInfo?.color?.nombre || colorInfo?.color || 'N/A';

  // Extraemos tallas disponibles (estado true y stock si fuera requerido, aunque simplificamos mapeando nombres)
  const variantesActivas = colorInfo?.variantes?.filter(v => v.estado) || [];
  
  // Extraemos nombres de tallas y ordenamos
  const tallasDisponibles = variantesActivas
    .map(v => v.talla?.nombre || v.talla || '')
    .filter(t => t !== '')
    .sort()
    .join(', ') || 'N/A';

  // Para el precio, buscamos el primer precio de venta válido en las variantes
  const varianteConPrecio = variantesActivas.find(v => v.precio_venta != null);
  const precio = varianteConPrecio 
    ? `$${Number(varianteConPrecio.precio_venta).toFixed(2)}` 
    : 'Consultar';

  // Construimos el mensaje de texto
  const lineas = [
    `Marca: ${marca}`,
    `Tipo: ${tipo}`,
    `Material: ${material}`,
    `Color: ${color}`,
    `Tallas: ${tallasDisponibles}`,
    `Precio: ${precio}`
  ];

  return lineas.join('\n');
};
