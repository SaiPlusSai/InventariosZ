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
