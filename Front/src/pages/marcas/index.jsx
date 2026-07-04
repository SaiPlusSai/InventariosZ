import { Card } from '../../components/ui'

export default function Marcas() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Marcas</h1>
        <button className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700">
          + Nueva Marca
        </button>
      </div>
      <Card>
        <p className="text-gray-500">No hay marcas registradas</p>
      </Card>
    </div>
  )
}
