# Inventarios Z - Frontend

Frontend del sistema de gestión de inventarios, orientado al negocio y construido con React + Vite.

## 📋 Características

- **Modular**: Estructura clara y escalable
- **Rápido**: Powered by Vite
- **Reactivo**: React + Hooks + Zustand
- **Estilizado**: Tailwind CSS
- **Validación**: React Hook Form
- **HTTP**: Axios centralizado

## 🚀 Inicio Rápido

### Instalación

```bash
# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env
```

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

### Producción

```bash
# Compilar
npm run build

# Vista previa
npm run preview
```

## 📁 Estructura

```
src/
├── assets/              # Imágenes, iconos, fonts
├── components/
│   ├── common/          # Componentes comunes compartidos
│   ├── layout/          # Sidebar, Header
│   └── ui/              # Button, Input, Card, etc.
├── layouts/
│   ├── AuthLayout.jsx   # Layout para auth
│   └── DashboardLayout.jsx # Layout principal
├── pages/
│   ├── auth/            # Páginas de autenticación
│   ├── dashboard/       # Dashboard principal
│   ├── productos/       # CRUD de productos
│   ├── marcas/          # CRUD de marcas
│   ├── materiales/      # CRUD de materiales
│   ├── colores/         # CRUD de colores
│   ├── tallas/          # CRUD de tallas
│   ├── tipos/           # CRUD de tipos
│   └── codigoProducto/  # CRUD de códigos
├── routes/              # Configuración de rutas
├── services/            # Axios y llamadas API
│   ├── axios.js         # Instancia centralizada
│   ├── productoService.js
│   ├── marcaService.js
│   ├── colorService.js
│   ├── materialService.js
│   ├── tallaService.js
│   ├── tipoCalzadoService.js
│   └── codigoProductoService.js
├── store/               # Zustand stores
│   ├── productoStore.js
│   ├── marcaStore.js
│   ├── colorStore.js
│   ├── materialStore.js
│   ├── tallaStore.js
│   ├── tipoCalzadoStore.js
│   └── wizardStore.js   # Estado del wizard
├── hooks/               # Hooks personalizados
│   ├── useAsync.js
│   └── useForm.js
├── utils/               # Funciones auxiliares
│   └── helpers.js
├── constants/           # Constantes globales
├── index.css            # Estilos globales
├── App.jsx              # Componente raíz
└── main.jsx             # Punto de entrada
```

## 🔧 Configuración

### Variables de Entorno

```env
VITE_API_URL=http://localhost:8000
VITE_API_TIMEOUT=10000
```

### Tailwind CSS

El proyecto viene preconfigurado con Tailwind CSS y colores personalizados.

```javascript
// tailwind.config.js
colors: {
  primary: {
    50: '#f0f9ff',
    500: '#0ea5e9',
    600: '#0284c7',
    // ... más colores
  }
}
```

## 📚 Stack

- **React** 18.2 - UI library
- **Vite** 5.0 - Build tool
- **React Router DOM** 6.20 - Routing
- **Axios** 1.6 - HTTP client
- **Zustand** 4.4 - State management
- **React Hook Form** 7.48 - Form handling
- **Tailwind CSS** 3.3 - Styling

## 🎯 Principios

- ✅ Una única fuente de verdad (backend)
- ✅ Componentes reutilizables
- ✅ Servicios centralizados
- ✅ Estado global mínimo (solo datos compartidos)
- ✅ Interfaz rápida e intuitiva

## 📝 Desarrollo

### Agregar un nuevo componente UI

```javascript
// src/components/ui/MyComponent.jsx
export default function MyComponent({ ...props }) {
  return <div>...</div>
}

// Exportar en src/components/ui/index.js
export { default as MyComponent } from './MyComponent'
```

### Agregar un nuevo hook

```javascript
// src/hooks/useMyHook.js
export const useMyHook = () => {
  // lógica
}

// Exportar en src/hooks/index.js
export { useMyHook } from './useMyHook'
```

### Agregar un nuevo servicio

```javascript
// src/services/myService.js
import axiosInstance from './axios'

export const myService = {
  getAll: (params) => axiosInstance.get('/my-endpoint', { params }),
  // ... más métodos
}
```

### Agregar un nuevo store

```javascript
// src/store/myStore.js
import { create } from 'zustand'

export const useMyStore = create((set) => ({
  // estado
  myAction: () => set(/* cambios */)
}))

// Usar en componentes
import { useMyStore } from '../store/myStore'
```

## 🐛 Debugging

El proyecto incluye intercepción de requests/responses con Axios:

- ✅ Autenticación automática (Bearer token)
- ✅ Manejo de errores global (401, etc.)
- ✅ Timeout configurable

## 📦 Dependencias Principales

| Paquete | Versión | Uso |
|---------|---------|-----|
| react | ^18.2 | UI |
| react-router-dom | ^6.20 | Routing |
| axios | ^1.6 | HTTP |
| zustand | ^4.4 | State |
| react-hook-form | ^7.48 | Forms |
| tailwindcss | ^3.3 | Styling |

## 🤝 Contribuir

1. Seguir la estructura de carpetas
2. Usar componentes reutilizables
3. Centralizar llamadas API en services
4. Mantener el estado global mínimo

## 📞 Soporte

Para reportar problemas o sugerencias, contacta al equipo de desarrollo.
