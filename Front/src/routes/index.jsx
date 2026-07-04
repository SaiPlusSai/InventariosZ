import { Routes as ReactRoutes, Route, Navigate } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import AuthLayout from '../layouts/AuthLayout'

// Pages
import Dashboard from '../pages/dashboard'
import Marcas from '../pages/marcas'
import Materiales from '../pages/materiales'
import Colores from '../pages/colores'
import Tallas from '../pages/tallas'
import Tipos from '../pages/tipos'
import CodigoProducto from '../pages/codigoProducto'
import Productos from '../pages/productos'

export default function Routes() {
  return (
    <ReactRoutes>
      {/* Dashboard Routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/marcas" element={<Marcas />} />
        <Route path="/materiales" element={<Materiales />} />
        <Route path="/colores" element={<Colores />} />
        <Route path="/tallas" element={<Tallas />} />
        <Route path="/tipos" element={<Tipos />} />
        <Route path="/codigo-producto" element={<CodigoProducto />} />
      </Route>

      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        {/* Auth pages will go here */}
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </ReactRoutes>
  )
}
