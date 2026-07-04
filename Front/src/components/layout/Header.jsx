export default function Header() {
  return (
    <header className="bg-white shadow-md">
      <div className="px-8 py-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">
          Bienvenido
        </h2>
        <div className="flex items-center space-x-4">
          <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
            👤 Perfil
          </button>
          <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
            🚪 Salir
          </button>
        </div>
      </div>
    </header>
  )
}
