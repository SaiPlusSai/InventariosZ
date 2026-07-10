import React from 'react';
import { 
  X, 
  MessageCircle, 
  Send, 
  Share2, 
  MessageSquare, 
  Briefcase, 
  Pin, 
  Mail, 
  Copy,
  Link
} from 'lucide-react';
import Button from './Button';

/**
 * Modal para seleccionar la red social o canal donde se compartirá el producto.
 */
export function ShareModal({ isOpen, onClose, onShare }) {
  if (!isOpen) return null;

  // Lista de redes sociales y canales de compartición
  const shareOptions = [
    { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: 'text-green-500 bg-green-50 hover:bg-green-100' },
    { id: 'telegram', name: 'Telegram', icon: Send, color: 'text-blue-500 bg-blue-50 hover:bg-blue-100' },
    { id: 'facebook', name: 'Facebook', icon: Share2, color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
    { id: 'x', name: 'X (Twitter)', icon: MessageSquare, color: 'text-gray-800 bg-gray-100 hover:bg-gray-200' },
    { id: 'linkedin', name: 'LinkedIn', icon: Briefcase, color: 'text-blue-700 bg-blue-50 hover:bg-blue-100' },
    { id: 'pinterest', name: 'Pinterest', icon: Pin, color: 'text-red-600 bg-red-50 hover:bg-red-100' },
    { id: 'email', name: 'Correo', icon: Mail, color: 'text-gray-600 bg-gray-100 hover:bg-gray-200' },
    { id: 'copy', name: 'Copiar texto', icon: Copy, color: 'text-gray-700 bg-gray-100 hover:bg-gray-200' },
    { id: 'copylink', name: 'Copiar enlace', icon: Link, color: 'text-gray-700 bg-gray-100 hover:bg-gray-200' },
  ];

  // Si existe navigator.share agregarlo como primera opción
  if (navigator.share) {
    shareOptions.unshift({ id: 'webshare', name: 'Sistema', icon: Share2, color: 'text-purple-600 bg-purple-50 hover:bg-purple-100' });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden flex flex-col">
        <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Compartir Producto</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-4 gap-4">
            {shareOptions.map((option) => (
              <div key={option.id} className="flex flex-col items-center gap-2">
                <button
                  onClick={() => onShare && onShare(option.id)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${option.color}`}
                  title={option.name}
                >
                  <option.icon size={24} />
                </button>
                <span className="text-[10px] font-medium text-gray-600 text-center leading-tight">
                  {option.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
