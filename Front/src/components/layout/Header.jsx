import { useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { ROUTES } from '../../constants'

export default function Header({ toggleSidebar }) {
  const location = useLocation()
  
  const getPageTitle = (pathname) => {
    switch(pathname) {
      case ROUTES.DASHBOARD: return 'Dashboard'
      case ROUTES.PRODUCTOS: return 'Productos'
      case ROUTES.MARCAS: return 'Marcas'
      case ROUTES.MATERIALES: return 'Materiales'
      case ROUTES.COLORES: return 'Colores'
      case ROUTES.TALLAS: return 'Tallas'
      case ROUTES.TIPOS: return 'Tipos'
      case ROUTES.CODIGO_PRODUCTO: return 'Código de Producto'
      default: return 'Sistema'
    }
  }

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm z-10 sticky top-0">
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center h-16">
        <button 
          onClick={toggleSidebar}
          className="mr-4 p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none lg:hidden"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-xl font-semibold text-gray-800 hidden sm:block">
          {getPageTitle(location.pathname)}
        </h2>
        {/* Espacio para breadcrumbs o acciones adicionales en el futuro si se requiere */}
        <div className="ml-auto"></div>
      </div>
    </header>
  )
}
