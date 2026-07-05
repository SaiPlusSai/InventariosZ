import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { Card } from '../../components/ui'

import HeaderDetalle from './detalle/HeaderDetalle'
import TabsDetalle from './detalle/TabsDetalle'
import GeneralTab from './detalle/GeneralTab'
import InventarioTab from './detalle/InventarioTab'
import PreciosTab from './detalle/PreciosTab'
import GaleriaTab from './detalle/GaleriaTab'

export default function ProductoDetalle({
  producto,
  onClose,
}) {

  const [tab, setTab] = useState('general')

  if (!producto) return null

  return (

    <AnimatePresence>

      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        exit={{
          opacity: 0,
        }}
      >

        <motion.div
          className="w-full max-w-7xl h-[92vh]"
          initial={{
            y: 40,
            opacity: 0,
            scale: .98,
          }}
          animate={{
            y: 0,
            opacity: 1,
            scale: 1,
          }}
          exit={{
            y: 30,
            opacity: 0,
          }}
          transition={{
            duration: .25,
          }}
        >

          <Card className="overflow-hidden h-full flex flex-col p-0 rounded-2xl shadow-2xl">

            <HeaderDetalle
              producto={producto}
              onClose={onClose}
            />

            <TabsDetalle
              tab={tab}
              setTab={setTab}
            />

            <div className="flex-1 overflow-y-auto bg-white">

              {tab === 'general' && (

                <GeneralTab
                  producto={producto}
                />

              )}

              {tab === 'inventario' && (

                <InventarioTab
                  producto={producto}
                />

              )}

              {tab === 'precios' && (

                <PreciosTab
                  producto={producto}
                />

              )}

              {tab === 'galeria' && (

                <GaleriaTab
                  producto={producto}
                />

              )}

            </div>

          </Card>

        </motion.div>

      </motion.div>

    </AnimatePresence>

  )

}