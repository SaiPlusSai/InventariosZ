import { Link, useLocation } from 'react-router-dom'
import { ROUTES } from '../../constants'

const menuItems = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: '📊' },
  { label: 'Productos', path: ROUTES.PRODUCTOS, icon: '👟' },
  { label: 'Marcas', path: ROUTES.MARCAS, icon: '🏷️' },
  { label: 'Colores', path: ROUTES.COLORES, icon: '🎨' },
  { label: 'Tallas', path: ROUTES.TALLAS, icon: '📏' },
  { label: 'Materiales', path: ROUTES.MATERIALES, icon: '🧵' },
  { label: 'Tipos', path: ROUTES.TIPOS, icon: '🔧' },
  { label: 'Código Producto', path: ROUTES.CODIGO_PRODUCTO, icon: '📛' },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="w-64 bg-primary-800 text-white shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Inventarios Z</h1>
      </div>
      <nav className="mt-8">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block px-6 py-3 transition-colors ${
              location.pathname === item.path
                ? 'bg-primary-700 border-l-4 border-white'
                : 'hover:bg-primary-700'
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
