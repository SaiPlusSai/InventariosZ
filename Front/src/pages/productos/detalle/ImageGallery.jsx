import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Image as ImageIcon,
  Images,
  Star,
  ZoomIn,
} from 'lucide-react'

export default function ImageGallery({
  imagenes = [],
}) {

  const principal =
    imagenes.find((i) => i.es_principal) ||
    imagenes[0]

  const [actual, setActual] = useState(principal)

  if (imagenes.length === 0) {

    return (

      <div className="rounded-2xl border-2 border-dashed border-slate-300 h-[520px] bg-slate-50 flex flex-col items-center justify-center">

        <ImageIcon
          size={70}
          className="text-slate-300"
        />

        <h3 className="mt-6 text-xl font-semibold text-slate-700">
          Sin imágenes
        </h3>

        <p className="text-slate-500 mt-2 text-center max-w-sm">
          Cuando agregues fotografías del producto
          aparecerán aquí.
        </p>

      </div>

    )

  }

  return (

    <div className="space-y-5">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2">

          <Images size={20} />

          <span className="font-semibold">
            Galería
          </span>

        </div>

        <span className="rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-sm font-semibold">

          {imagenes.length} imágenes

        </span>

      </div>

      <div className="relative rounded-2xl overflow-hidden border shadow-md bg-slate-100 h-[400px] md:h-[480px] flex items-center justify-center">

        <AnimatePresence mode="wait">

          <motion.img
            key={actual.id}
            src={actual.ruta}
            alt="Producto"
            initial={{
              opacity: 0,
              scale: 1.05,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: .25,
            }}
            className="
              w-full
              h-full
              object-contain
              transition-transform
              duration-300
              hover:scale-105
              cursor-zoom-in
            "
          />

        </AnimatePresence>

        {actual.es_principal && (

          <div className="absolute top-5 left-5">

            <span className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-full text-sm shadow">

              <Star size={15} fill="white" />

              Principal

            </span>

          </div>

        )}

        <div className="absolute bottom-5 right-5 bg-black/60 text-white rounded-full p-3">

          <ZoomIn size={18} />

        </div>

      </div>

      <div className="flex flex-wrap gap-3 mt-4">

        {imagenes.map((img) => (

          <button
            key={img.id}
            onClick={() => setActual(img)}
            className={`
              relative
              w-20
              h-20
              sm:w-[84px]
              sm:h-[84px]
              flex-shrink-0
              rounded-lg
              overflow-hidden
              transition-all
              duration-200
              hover:scale-105

              ${
                actual.id === img.id
                  ? 'border-[3px] border-blue-600 shadow-md ring-2 ring-blue-100 ring-offset-1'
                  : 'border border-slate-200 hover:border-blue-400 opacity-80 hover:opacity-100'
              }
            `}
          >

            <img
              src={img.ruta}
              alt=""
              className="
                w-full
                h-full
                object-cover
              "
            />

            {img.es_principal && (

              <div className="absolute top-1.5 right-1.5">

                <div className="bg-blue-600 text-white rounded-full p-1 shadow-sm">

                  <Star
                    size={11}
                    fill="white"
                  />

                </div>

              </div>

            )}

          </button>

        ))}

      </div>

    </div>

  )

}