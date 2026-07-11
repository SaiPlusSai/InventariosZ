import os
path = 'Front/src/pages/productos/detalle/InventarioTab.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports
content = content.replace(
    \"import ProgressStock from './ProgressStock'\",
    \"import ProgressStock from './ProgressStock'\nimport MovimientoModal from '../movimientos/MovimientoModal'\nimport KardexTable from '../movimientos/KardexTable'\nimport { useState } from 'react'\nimport Button from '../../../components/ui/Button'\"
)

# Add state inside component
content = content.replace(
    \"export default function InventarioTab({ producto }) {\",
    \"export default function InventarioTab({ producto, refreshProducto }) {\n  const [isModalOpen, setIsModalOpen] = useState(false)\n  const [selectedProductId, setSelectedProductId] = useState(null)\n  const [selectedProductStock, setSelectedProductStock] = useState(0)\n  const [showKardexId, setShowKardexId] = useState(null)\n\n  const openModal = (id, stock) => {\n    setSelectedProductId(id)\n    setSelectedProductStock(stock)\n    setIsModalOpen(true)\n  }\n\"
)

# Add headers to table
content = content.replace(
    \"<th className=\\\"px-6 py-3\\\">Estado</th>\",
    \"<th className=\\\"px-6 py-3\\\">Estado</th>\n                  <th className=\\\"px-6 py-3 text-right\\\">Acciones</th>\"
)

# Add buttons to table row
content = content.replace(
    \"                    </td>\n                  </tr>\",
    \"                    </td>\n                    <td className=\\\"px-6 py-4 text-right flex justify-end gap-2\\\">\n                      <Button variant=\\\"secondary\\\" className=\\\"px-3 py-1 text-xs\\\" onClick={() => setShowKardexId(showKardexId === v.id ? null : v.id)}>\n                        {showKardexId === v.id ? 'Ocultar Kardex' : 'Kardex'}\n                      </Button>\n                      <Button variant=\\\"primary\\\" className=\\\"px-3 py-1 text-xs\\\" onClick={() => openModal(v.id, v.stock_actual)}>\n                        Mover Stock\n                      </Button>\n                    </td>\n                  </tr>\n                  {showKardexId === v.id && (\n                    <tr key={\kardex-\\}>\n                      <td colSpan=\\\"7\\\" className=\\\"p-4 bg-gray-50 border-t border-gray-100\\\">\n                        <KardexTable productoId={v.id} />\n                      </td>\n                    </tr>\n                  )}\"
)

# Render single product button if NO variants
content = content.replace(
    \"{producto.variantes && producto.variantes.length > 0 && (\",
    \"      {(!producto.variantes || producto.variantes.length === 0) && (\n        <div className=\\\"mt-8 space-y-4\\\">\n          <div className=\\\"flex justify-between items-center\\\">\n            <h3 className=\\\"text-xl font-bold\\\">Kardex (Historial de Movimientos)</h3>\n            <Button variant=\\\"primary\\\" onClick={() => openModal(producto.id, producto.stock_actual)}>\n              Registrar Movimiento\n            </Button>\n          </div>\n          <KardexTable productoId={producto.id} />\n        </div>\n      )}\n\n      {producto.variantes && producto.variantes.length > 0 && (\"
)

# Add Modal
content = content.replace(
    \"    </div>\n  )\n}\",
    \"      <MovimientoModal \n        isOpen={isModalOpen}\n        onClose={() => setIsModalOpen(false)}\n        productoId={selectedProductId}\n        stockActual={selectedProductStock}\n        onMovimientoRealizado={() => {\n          if(refreshProducto) refreshProducto();\n          // To trigger Kardex refresh we could add a key or just let the store re-fetch it if needed.\n        }}\n      />\n    </div>\n  )\n}\"
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)