/**
 * IShareProvider Interface conceptual:
 * - share(payload): Promise<void>
 * payload: { title, text, url, image }
 */

export class WebShareProvider {
  async share(payload) {
    if (!navigator.share) {
      throw new Error('Web Share API no soportado');
    }
    await navigator.share({
      title: payload.title,
      text: payload.text,
      url: payload.url,
    });
  }
}

export class WhatsAppProvider {
  async share(payload) {
    // Para WhatsApp web/app el formato es: wa.me/?text=...
    const textToShare = `${payload.title}\n\n${payload.text}\n\n${payload.url}`;
    const url = `https://wa.me/?text=${encodeURIComponent(textToShare)}`;
    window.open(url, '_blank');
  }
}

export class TelegramProvider {
  async share(payload) {
    // t.me/share/url?url=...&text=...
    const url = `https://t.me/share/url?url=${encodeURIComponent(payload.url)}&text=${encodeURIComponent(payload.title + '\n\n' + payload.text)}`;
    window.open(url, '_blank');
  }
}

export class FacebookProvider {
  async share(payload) {
    // Facebook solo lee metadata (Open Graph) desde la URL
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(payload.url)}`;
    window.open(url, '_blank');
  }
}

export class XProvider {
  async share(payload) {
    // Twitter share: intent/tweet?url=...&text=...
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(payload.url)}&text=${encodeURIComponent(payload.title + '\n' + payload.text)}`;
    window.open(url, '_blank');
  }
}

export class LinkedInProvider {
  async share(payload) {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(payload.url)}`;
    window.open(url, '_blank');
  }
}

export class PinterestProvider {
  async share(payload) {
    // Pinterest requiere media (imagen) y url
    const media = payload.image ? `&media=${encodeURIComponent(payload.image)}` : '';
    const url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(payload.url)}${media}&description=${encodeURIComponent(payload.title + ' - ' + payload.text)}`;
    window.open(url, '_blank');
  }
}

export class EmailProvider {
  async share(payload) {
    const body = `${payload.title}\n\n${payload.text}\n\n${payload.url}`;
    const url = `mailto:?subject=${encodeURIComponent(payload.title)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  }
}

export class ClipboardTextProvider {
  async share(payload) {
    const text = `${payload.title}\n\n${payload.text}\n\n${payload.url}`;
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      throw new Error('Clipboard API no disponible');
    }
  }
}

export class ClipboardLinkProvider {
  async share(payload) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(payload.url);
    } else {
      throw new Error('Clipboard API no disponible');
    }
  }
}

// ==========================================
// ARQUITECTURA EMPRESARIAL (FASE 16 a 19)
// ==========================================

export class MetaCloudProvider {
  async share(payload) {
    console.log('Mock: Enviando a Meta Cloud API', payload);
    // throw new Error('Not implemented: Meta Cloud API requiere credenciales.');
  }
}

export class TelegramBotProvider {
  async share(payload) {
    console.log('Mock: Enviando a Telegram Bot API', payload);
    // throw new Error('Not implemented: Telegram Bot API requiere token.');
  }
}

/**
 * Factory para unificar todos los canales
 */
export class ShareFactory {
  static getProvider(channelId) {
    switch (channelId) {
      case 'webshare': return new WebShareProvider();
      case 'whatsapp': return new WhatsAppProvider();
      case 'telegram': return new TelegramProvider();
      case 'facebook': return new FacebookProvider();
      case 'x': return new XProvider();
      case 'linkedin': return new LinkedInProvider();
      case 'pinterest': return new PinterestProvider();
      case 'email': return new EmailProvider();
      case 'copy': return new ClipboardTextProvider();
      case 'copylink': return new ClipboardLinkProvider();
      case 'meta-cloud': return new MetaCloudProvider();
      case 'telegram-bot': return new TelegramBotProvider();
      default:
        throw new Error(`Canal no soportado: ${channelId}`);
    }
  }
}
