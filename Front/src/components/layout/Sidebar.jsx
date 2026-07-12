import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  ChevronDown,
  ChevronRight,
  Tag,
  Palette,
  Ruler,
  Hammer,
  Barcode,
  User,
  LogOut,
  X
} from 'lucide-react'

import { ROUTES } from '../../constants'

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation()

  const [catalogosOpen, setCatalogosOpen] = useState(true)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary-800 text-white shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex items-center justify-between flex-shrink-0 border-b border-primary-700/50">
          <h1 className="text-2xl font-bold tracking-tight">Inventarios Z</h1>
          <button 
            className="lg:hidden text-white/70 hover:text-white transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-primary-600 scrollbar-track-transparent">

          {/* Dashboard */}
        <Link
          to={ROUTES.DASHBOARD}
          className={`flex items-center px-6 py-3 transition-colors ${
            isActive(ROUTES.DASHBOARD)
              ? 'bg-primary-700 border-l-4 border-white'
              : 'hover:bg-primary-700'
          }`}
        >
          <LayoutDashboard size={18} className="mr-3" />
          Dashboard
        </Link>

        {/* Productos */}
        <Link
          to={ROUTES.PRODUCTOS}
          className={`flex items-center px-6 py-3 transition-colors ${
            isActive(ROUTES.PRODUCTOS)
              ? 'bg-primary-700 border-l-4 border-white'
              : 'hover:bg-primary-700'
          }`}
        >
          <Package size={18} className="mr-3" />
          Productos
        </Link>

        {/* Catálogos */}
        <button
          onClick={() => setCatalogosOpen(!catalogosOpen)}
          className="w-full flex items-center justify-between px-6 py-3 hover:bg-primary-700 transition-colors"
        >
          <div className="flex items-center">
            <Package size={18} className="mr-3" />
            Catálogos
          </div>

          {catalogosOpen ? (
            <ChevronDown size={18} />
          ) : (
            <ChevronRight size={18} />
          )}
        </button>

        {catalogosOpen && (
          <div className="ml-4">

            <Link
              to={ROUTES.MARCAS}
              className={`flex items-center px-6 py-2 ${
                isActive(ROUTES.MARCAS)
                  ? 'bg-primary-700 border-l-4 border-white'
                  : 'hover:bg-primary-700'
              }`}
            >
              <Tag size={16} className="mr-3" />
              Marcas
            </Link>

            <Link
              to={ROUTES.COLORES}
              className={`flex items-center px-6 py-2 ${
                isActive(ROUTES.COLORES)
                  ? 'bg-primary-700 border-l-4 border-white'
                  : 'hover:bg-primary-700'
              }`}
            >
              <Palette size={16} className="mr-3" />
              Colores
            </Link>

            <Link
              to={ROUTES.TALLAS}
              className={`flex items-center px-6 py-2 ${
                isActive(ROUTES.TALLAS)
                  ? 'bg-primary-700 border-l-4 border-white'
                  : 'hover:bg-primary-700'
              }`}
            >
              <Ruler size={16} className="mr-3" />
              Tallas
            </Link>

            <Link
              to={ROUTES.MATERIALES}
              className={`flex items-center px-6 py-2 ${
                isActive(ROUTES.MATERIALES)
                  ? 'bg-primary-700 border-l-4 border-white'
                  : 'hover:bg-primary-700'
              }`}
            >
              <Hammer size={16} className="mr-3" />
              Materiales
            </Link>

            <Link
              to={ROUTES.TIPOS}
              className={`flex items-center px-6 py-2 ${
                isActive(ROUTES.TIPOS)
                  ? 'bg-primary-700 border-l-4 border-white'
                  : 'hover:bg-primary-700'
              }`}
            >
              <Package size={16} className="mr-3" />
              Tipos
            </Link>

            <Link
              to={ROUTES.CODIGO_PRODUCTO}
              className={`flex items-center px-6 py-2 ${
                isActive(ROUTES.CODIGO_PRODUCTO)
                  ? 'bg-primary-700 border-l-4 border-white'
                  : 'hover:bg-primary-700 text-white/80 hover:text-white'
              }`}
            >
              <Barcode size={16} className="mr-3" />
              Código Producto
            </Link>

          </div>
        )}
        </nav>

        {/* Footer actions */}
        <div className="border-t border-primary-700/50 p-4 space-y-2 flex-shrink-0">
          <button className="w-full flex items-center px-4 py-2.5 text-sm rounded-lg text-white/80 hover:text-white hover:bg-primary-700 transition-colors">
            <User size={18} className="mr-3" />
            Perfil
          </button>
          <button className="w-full flex items-center px-4 py-2.5 text-sm rounded-lg text-red-200 hover:text-white hover:bg-red-500/20 transition-colors">
            <LogOut size={18} className="mr-3" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}