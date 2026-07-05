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

        <div className="grid md:grid-cols-2 gap-4">

          <InfoCard

            icon={<Tag size={18}/>}

            title="Marca"

          >

            {producto.marca?.nombre}

          </InfoCard>

          <InfoCard

            icon={<Package size={18}/>}

            title="Código"

          >

            {producto.codigo}

          </InfoCard>

          <InfoCard

            icon={<Shirt size={18}/>}

            title="Tipo"

          >

            {producto.tipo_calzado?.nombre}

          </InfoCard>

          <InfoCard

            icon={<Package size={18}/>}

            title="Material"

          >

            {producto.material?.nombre}

          </InfoCard>

          <div className="rounded-xl border p-5">

            <div className="flex items-center gap-2 mb-3">

              <Palette size={18}/>

              <span className="font-semibold">

                Color

              </span>

            </div>

            <div className="flex items-center gap-3">

              <div

                className="w-5 h-5 rounded-full border"

                style={{

                  background:

                  producto.color?.codigo_hex ||

                  '#ccc',

                }}

              />

              {producto.color?.nombre}

            </div>

          </div>

          <InfoCard

            icon={<Ruler size={18}/>}

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