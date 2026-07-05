import { useState } from 'react'
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
} from 'lucide-react'

import { ROUTES } from '../../constants'

export default function Sidebar() {
  const location = useLocation()

  const [catalogosOpen, setCatalogosOpen] = useState(true)

  const isActive = (path) => location.pathname === path

  return (
    <aside className="w-64 bg-primary-800 text-white shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Inventarios Z</h1>
      </div>

      <nav className="mt-8">

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
                  : 'hover:bg-primary-700'
              }`}
            >
              <Barcode size={16} className="mr-3" />
              Código Producto
            </Link>

          </div>
        )}

      </nav>
    </aside>
  )
}