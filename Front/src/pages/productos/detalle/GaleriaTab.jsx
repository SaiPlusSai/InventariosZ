import {
  Image as ImageIcon,
} from 'lucide-react'

import ImageGallery from './ImageGallery'

export default function GaleriaTab({
  producto,
}) {

  const imagenes = producto.imagenes ?? []

  return (

    <div className="p-8 space-y-8">

      <div>

        <h2 className="text-3xl font-bold">

          Galería de Imágenes

        </h2>

        <p className="text-gray-500 mt-1">

          Fotografías asociadas al producto.

        </p>

      </div>

      {imagenes.length === 0 ? (

        <div className="border-2 border-dashed rounded-2xl h-96 flex flex-col justify-center items-center bg-slate-50">

          <ImageIcon
            size={70}
            className="text-gray-300"
          />

          <h3 className="mt-6 text-xl font-semibold text-gray-700">

            No existen imágenes

          </h3>

          <p className="text-gray-500 mt-2 text-center max-w-md">

            Este producto todavía no tiene imágenes registradas.
            Cuando agregues fotografías aparecerán aquí.

          </p>

        </div>

      ) : (

        <>

          <div className="flex justify-between items-center">

            <span className="text-gray-600">

              Total de imágenes

            </span>

            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">

              {imagenes.length}

            </span>

          </div>

          <ImageGallery
            imagenes={imagenes}
          />

        </>

      )}

    </div>

  )

}