import { formatProductShareText } from '../utils/shareFormatter';

/**
 * Servicio centralizado para preparar y empaquetar 
 * la información de un producto antes de enviarla a los Providers.
 */
class ShareService {
  /**
   * Genera el payload universal estandarizado para ser consumido por cualquier Provider.
   * @param {Object} producto - Producto general.
   * @param {Object} colorInfo - Variante específica seleccionada.
   * @returns {Object} Payload de compatibilidad para Providers.
   */
  prepareSharePayload(producto, colorInfo) {
    console.log('[DEBUG 2 - shareService] Recibiendo datos:', { producto, colorInfo });
    const descripcion = formatProductShareText(producto, colorInfo);
    
    // Título descriptivo para Web Share API o correos
    const titulo = `Producto: ${producto.marca?.nombre || producto.marca || ''} - ${producto.codigo || ''}`;

    // Extraemos la URL de la imagen si existe (Supabase)
    const imagenUrl = colorInfo.imagen_principal || null;

    // En un futuro el catálogo web tendrá URLs dinámicas para cada producto.
    // Usaremos un placeholder o URL real de catálogo si la hay.
    const url = typeof window !== 'undefined' 
      ? `${window.location.origin}/catalogo/${producto.codigo_producto_id}?color=${colorInfo.color_id}`
      : `https://tusistema.com/catalogo/${producto.codigo_producto_id}?color=${colorInfo.color_id}`;

    return {
      title: titulo,
      text: descripcion,
      url: url,
      image: imagenUrl
    };
  }
}

export const shareService = new ShareService();
