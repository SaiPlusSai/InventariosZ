export const TIPO_MOVIMIENTO = {
  ENTRADA: 'ENTRADA',
  SALIDA: 'SALIDA',
  AJUSTE: 'AJUSTE'
};

export const ORIGEN_MOVIMIENTO = {
  COMPRA: 'COMPRA',
  INVENTARIO_INICIAL: 'INVENTARIO_INICIAL',
  INTERCAMBIO: 'INTERCAMBIO',
  OTRO: 'OTRO',
  VENTA: 'VENTA',
  MERMA_DANO: 'MERMA_DANO',
  MERMA_ROBO: 'MERMA_ROBO',
  MERMA_PERDIDA: 'MERMA_PERDIDA',
  AJUSTE_MANUAL: 'AJUSTE_MANUAL'
};

export const ORIGENES_UI = {
  [TIPO_MOVIMIENTO.ENTRADA]: [
    { id: ORIGEN_MOVIMIENTO.COMPRA, label: 'Compra' },
    { id: ORIGEN_MOVIMIENTO.INVENTARIO_INICIAL, label: 'Inventario Inicial' },
    { id: ORIGEN_MOVIMIENTO.INTERCAMBIO, label: 'Intercambio' },
    { id: ORIGEN_MOVIMIENTO.OTRO, label: 'Otro' }
  ],
  [TIPO_MOVIMIENTO.SALIDA]: [
    { id: ORIGEN_MOVIMIENTO.VENTA, label: 'Venta' },
    { id: ORIGEN_MOVIMIENTO.INTERCAMBIO, label: 'Intercambio' },
    { id: 'MERMA', label: 'Merma' },
    { id: ORIGEN_MOVIMIENTO.AJUSTE_MANUAL, label: 'Ajuste Manual' }
  ],
  [TIPO_MOVIMIENTO.AJUSTE]: [
    { id: ORIGEN_MOVIMIENTO.AJUSTE_MANUAL, label: 'Ajuste Manual' }
  ]
};

export const SUB_ORIGENES_MERMA = [
  { id: 'ROBO', label: 'Robo' },
  { id: 'DANO', label: 'Daño' },
  { id: 'PERDIDA', label: 'Pérdida' }
];

export const TIPO_MOVIMIENTO_BADGES = {
  [TIPO_MOVIMIENTO.ENTRADA]: 'bg-green-100 text-green-800 border-green-200',
  [TIPO_MOVIMIENTO.SALIDA]: 'bg-red-100 text-red-800 border-red-200',
  [TIPO_MOVIMIENTO.AJUSTE]: 'bg-amber-100 text-amber-800 border-amber-200'
};

export const ORIGEN_MOVIMIENTO_BADGES = {
  [ORIGEN_MOVIMIENTO.COMPRA]: 'bg-blue-100 text-blue-800 border-blue-200',
  [ORIGEN_MOVIMIENTO.VENTA]: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  [ORIGEN_MOVIMIENTO.INVENTARIO_INICIAL]: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  [ORIGEN_MOVIMIENTO.INTERCAMBIO]: 'bg-purple-100 text-purple-800 border-purple-200',
  [ORIGEN_MOVIMIENTO.MERMA_DANO]: 'bg-rose-100 text-rose-800 border-rose-200',
  [ORIGEN_MOVIMIENTO.MERMA_ROBO]: 'bg-red-100 text-red-800 border-red-200',
  [ORIGEN_MOVIMIENTO.MERMA_PERDIDA]: 'bg-orange-100 text-orange-800 border-orange-200',
  [ORIGEN_MOVIMIENTO.AJUSTE_MANUAL]: 'bg-slate-100 text-slate-800 border-slate-200',
  [ORIGEN_MOVIMIENTO.OTRO]: 'bg-gray-100 text-gray-800 border-gray-200'
};
