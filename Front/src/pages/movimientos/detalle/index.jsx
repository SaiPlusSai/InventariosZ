import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageHeader from '../../../components/ui/PageHeader'
import InfoCard from '../../productos/detalle/InfoCard'
import MetricCard from '../../productos/detalle/MetricCard'
import { TIPO_MOVIMIENTO_BADGES, ORIGEN_MOVIMIENTO_BADGES } from '../../../constants/movimientos'
import { ArrowLeft, Box, Calendar, Package, Tag, User, Hash, AlertCircle, FileText } from 'lucide-react'
import { movimientoService } from '../../../services/movimientoService'
import { Loader2 } from 'lucide-react'

export default function MovimientoDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movimiento, setMovimiento] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDetalle = async () => {
      try {
        // En lugar de listar todo, si tuviéramos un endpoint GET /movimientos/:id
        // Para este sprint y porque la BD es relacional, podemos usar listar con filtro de ID exacto
        // O si ya implementé `obtener` en service.py
        const response = await movimientoService.obtener(id)
        setMovimiento(response.data)
      } catch (error) {
        console.error("Error cargando detalle", error)
      } finally {
        setLoading(false)
      }
    }
    fetchDetalle()
  }, [id])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Cargando detalle del movimiento...</p>
      </div>
    )
  }

  if (!movimiento) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 min-h-[500px]">
        <AlertCircle className="w-8 h-8 mb-4 text-red-400" />
        <p>Movimiento no encontrado.</p>
        <button onClick={() => navigate('/movimientos')} className="mt-4 text-indigo-600 hover:underline">
          Volver al listado
        </button>
      </div>
    )
  }

  // Desestructuración segura asumiendo que el DTO viene plano
  // En la implementación real el DTO plano viene del endpoint listado, pero `obtener` puede traer un objeto completo.
  // Asumiremos que el backend devuelve la estructura completa (producto anidado) o usaremos fallback a plano.
  const prod = movimiento.producto || {}
  const cod = prod.codigo_producto || {}
  
  const m = {
    fecha: movimiento.created_at || movimiento.fecha,
    tipo: movimiento.tipo_movimiento || movimiento.tipoMovimiento,
    origen: movimiento.origen,
    observacion: movimiento.observacion,
    usuario: movimiento.usuario_id || 'Sistema',
    documento: movimiento.documento_id ? `${movimiento.documento_tipo} #${movimiento.documento_id}` : 'Ninguno',
    
    codigo: movimiento.codigo || cod.codigo || 'N/A',
    marca: movimiento.marca || (cod.marca && cod.marca.nombre) || 'N/A',
    tipoCalzado: movimiento.tipo_calzado || (prod.tipo_calzado && prod.tipo_calzado.nombre) || 'N/A',
    material: movimiento.material || (prod.material && prod.material.nombre) || 'N/A',
    color: movimiento.color || (prod.color && prod.color.nombre) || 'N/A',
    talla: movimiento.talla || (prod.talla && prod.talla.nombre) || 'N/A',
    productoNombre: movimiento.producto_nombre || prod.descripcion || 'N/A',
    
    cantidad: movimiento.cantidad,
    stockAnt: movimiento.stock_anterior || movimiento.stockAnterior,
    stockNuev: movimiento.stock_nuevo || movimiento.stockNuevo,
    
    idMov: movimiento.id,
    idProd: movimiento.producto_id || movimiento.productoId,
  }

  const tipoBadge = TIPO_MOVIMIENTO_BADGES[m.tipo] || 'bg-slate-100 text-slate-800 border-slate-200'
  const origenBadge = ORIGEN_MOVIMIENTO_BADGES[m.origen] || 'bg-slate-100 text-slate-800 border-slate-200'

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 relative">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/movimientos')}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">
              Detalle de Movimiento
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Ref: #{m.idMov} • {new Date(m.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Banner Principal */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                <Package className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <div className="text-sm text-slate-500 font-medium mb-1">Producto Afectado</div>
                <h2 className="text-xl font-bold text-slate-900">{m.productoNombre}</h2>
                <div className="text-sm text-indigo-600 font-medium mt-1">Código: {m.codigo}</div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 items-start md:items-end w-full md:w-auto">
               <span className={`px-3 py-1.5 text-xs font-bold border rounded-full uppercase tracking-wider ${tipoBadge}`}>
                 {m.tipo}
               </span>
               <span className={`px-3 py-1.5 text-xs font-bold border rounded-full uppercase tracking-wider ${origenBadge}`}>
                 {m.origen?.replace('_', ' ')}
               </span>
            </div>
          </div>

          {/* Grilla de Métricas e Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Columna Izquierda: Métricas e Inventario */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Box size={16} className="text-slate-400" />
                  Impacto en Stock
                </h3>
                
                <div className="space-y-4">
                  <MetricCard 
                    label="Cantidad Movida" 
                    value={m.cantidad} 
                    trend={m.tipo === 'ENTRADA' ? 'up' : m.tipo === 'SALIDA' ? 'down' : 'neutral'}
                    className="bg-slate-50"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Antes</div>
                      <div className="text-lg font-medium text-slate-700">{m.stockAnt}</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Después</div>
                      <div className="text-lg font-bold text-slate-900">{m.stockNuev}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FileText size={16} className="text-slate-400" />
                  Detalles Operativos
                </h3>
                <div className="space-y-3">
                  <InfoCard icon={Calendar} label="Fecha y Hora" value={new Date(m.fecha).toLocaleString()} />
                  <InfoCard icon={User} label="Usuario" value={m.usuario} />
                  <InfoCard icon={Tag} label="Documento Relacionado" value={m.documento} />
                </div>
                
                {m.observacion && (
                  <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">Observaciones</div>
                    <p className="text-sm text-amber-900 leading-relaxed">{m.observacion}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Columna Derecha: Detalles del Producto y Técnicos */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Tag size={16} className="text-slate-400" />
                    Características del Producto
                  </h3>
                </div>
                <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-6">
                  <InfoCard label="Marca" value={m.marca} />
                  <InfoCard label="Categoría" value={m.tipoCalzado} />
                  <InfoCard label="Material Principal" value={m.material} />
                  <InfoCard label="Color Variante" value={m.color} />
                  <InfoCard label="Talla (US/EU)" value={m.talla} />
                </div>
              </div>

              <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden text-slate-300">
                <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/50">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Hash size={16} className="text-slate-500" />
                    Información Técnica de Auditoría
                  </h3>
                </div>
                <div className="p-6 grid grid-cols-2 gap-4 font-mono text-xs">
                  <div>
                    <span className="text-slate-500 block mb-1">ID Movimiento BD</span>
                    <span className="text-emerald-400">{m.idMov}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">ID Producto BD</span>
                    <span className="text-emerald-400">{m.idProd}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block mb-1">Timestamp Registro</span>
                    <span className="text-emerald-400">{m.fecha}</span>
                  </div>
                </div>
              </div>
              
            </div>
            
          </div>
        </div>
      </div>
    </div>
  )
}
