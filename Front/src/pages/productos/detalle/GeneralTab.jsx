import {

  Tag,

  Package,

  Shirt,

  Palette,

  Ruler,

  FileText,

} from 'lucide-react'

import InfoCard from './InfoCard'

import ImageGallery from './ImageGallery'

export default function GeneralTab({

  producto,

}) {

  return (

    <div className="grid lg:grid-cols-3 gap-8 p-8">

      <div>

        <ImageGallery

          imagenes={producto.imagenes}

        />

      </div>

      <div className="lg:col-span-2">

        <h2 className="text-2xl font-bold mb-6">

          Información General

        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

          <InfoCard
            icon={<Tag size={18} className="text-gray-400" />}
            title="Marca"
          >
            {producto.marca?.nombre}
          </InfoCard>

          <InfoCard
            icon={<Package size={18} className="text-gray-400" />}
            title="Código"
          >
            {producto.codigo}
          </InfoCard>

          <InfoCard
            icon={<Shirt size={18} className="text-gray-400" />}
            title="Tipo"
          >
            {producto.tipo_calzado?.nombre}
          </InfoCard>

          <InfoCard
            icon={<Package size={18} className="text-gray-400" />}
            title="Material"
          >
            {producto.material?.nombre}
          </InfoCard>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2 text-gray-500">
              <Palette size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Color
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className="w-6 h-6 rounded-full border shadow-sm ring-2 ring-white"
                style={{
                  background: producto.color?.codigo_hex || '#ccc',
                }}
              />
              <span className="font-medium text-gray-800">
                {producto.color?.nombre}
              </span>
            </div>
          </div>

          <InfoCard
            icon={<Ruler size={18} className="text-gray-400" />}
            title="Talla"
          >
            {producto.talla?.nombre}
          </InfoCard>

        </div>

        <div className="mt-8">

          <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">

            <FileText size={22}/>

            Descripción

          </h2>

          <div
            className="
              rounded-xl
              border
              bg-slate-50
              p-6
              leading-8
              min-h-[180px]
            "
          >

            {

              producto.descripcion ||

              'Sin descripción.'

            }

          </div>

        </div>

      </div>

    </div>

  )

}