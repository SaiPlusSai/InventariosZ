import { Pencil, X } from 'lucide-react'

import StatusBadge from './StatusBadge'

import { Button } from '../../../components/ui'

export default function HeaderDetalle({
  producto,
  onClose,
  onEdit,
}) {

  return (

    <div className="bg-slate-800 text-white px-4 sm:px-8 py-4 sm:py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

      <div>

        <h1 className="text-3xl font-bold">

          {producto.descripcion || producto.codigo}

        </h1>

        <div className="flex items-center gap-3 mt-2">

          <span className="text-slate-300">

            Código:

          </span>

          <span className="font-semibold">

            {producto.codigo}

          </span>

        </div>

        <div className="flex gap-3 mt-4">

          <StatusBadge
            activo={producto.estado}
          />

          <span className="text-sm text-slate-300">

            Actualizado

            {' '}

            {new Date(
              producto.updated_at
            ).toLocaleDateString()}

          </span>

        </div>

      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">

        <Button
          variant="primary"
          onClick={onEdit}
          className="w-full sm:w-auto flex justify-center"
        >
          <Pencil
            size={18}
            className="mr-2"
          />

          Editar

        </Button>

        <Button
          variant="secondary"
          onClick={onClose}
          className="w-full sm:w-auto flex justify-center"
        >
          <X
            size={18}
            className="mr-2"
          />

          Cerrar

        </Button>

      </div>

    </div>

  )

}