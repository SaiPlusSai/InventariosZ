# 📤 Payload Exacto: Frontend → Backend

## Estructura JSON Enviada al Backend

El frontend envía exactamente esta estructura al endpoint `POST /productos/crear-completo`:

```json
{
  "codigo": "PROD-001",
  "marca_id": 1,
  "tipo_calzado_id": 1,
  "material_id": 1,
  "descripcion": "Zapatilla deportiva negra",
  "variantes": [
    {
      "color_id": 1,
      "talla_id": 1,
      "stock_actual": 10,
      "stock_minimo": 0,
      "stock_maximo": null,
      "precio_compra": 80.00,
      "precio_venta": 150.00,
      "estado": true
    },
    {
      "color_id": 1,
      "talla_id": 2,
      "stock_actual": 8,
      "stock_minimo": 0,
      "stock_maximo": null,
      "precio_compra": 80.00,
      "precio_venta": 150.00,
      "estado": true
    },
    {
      "color_id": 2,
      "talla_id": 1,
      "stock_actual": 5,
      "stock_minimo": 0,
      "stock_maximo": null,
      "precio_compra": 90.00,
      "precio_venta": 160.00,
      "estado": true
    }
  ],
  "imagenes": [
    {
      "bucket": "local",
      "ruta": "imagenes/1704067200-zapatilla-frente.jpg",
      "nombre_archivo": "zapatilla-frente.jpg",
      "es_principal": true,
      "orden": 1
    },
    {
      "bucket": "local",
      "ruta": "imagenes/1704067201-zapatilla-lado.jpg",
      "nombre_archivo": "zapatilla-lado.jpg",
      "es_principal": false,
      "orden": 2
    }
  ]
}
```

---

## ✅ Validación: Estructura vs Backend

### ✅ CORRECTO - Acepta Backend

```javascript
{
  "codigo": "string (2-50 chars)",
  "marca_id": "number > 0",
  "tipo_calzado_id": "number > 0",
  "material_id": "number > 0",
  "descripcion": "string | null (max 500)",
  "variantes": [
    {
      "color_id": "number > 0",
      "talla_id": "number > 0",
      "stock_actual": "number >= 0",
      "stock_minimo": "number >= 0",
      "stock_maximo": "number | null",
      "precio_compra": "decimal | null >= 0",
      "precio_venta": "decimal >= 0",  // REQUERIDO
      "estado": "boolean"
    }
  ],
  "imagenes": [
    {
      "bucket": "string (max 100)",
      "ruta": "string",
      "nombre_archivo": "string | null",
      "es_principal": "boolean",
      "orden": "number"
    }
  ]
}
```

---

## 🔍 Campos Clave

### Variantes
| Campo | Tipo | Requerido | Rango | Descripción |
|-------|------|-----------|-------|-------------|
| `color_id` | int | ✅ Sí | > 0 | ID del color |
| `talla_id` | int | ✅ Sí | > 0 | ID de la talla |
| `stock_actual` | int | ✅ Sí | ≥ 0 | Stock disponible |
| `stock_minimo` | int | ✅ Sí | ≥ 0 | Stock mínimo permitido |
| `stock_maximo` | int | ❌ No | ≥ 0 | Stock máximo permitido (puede ser null) |
| `precio_compra` | decimal | ❌ No | ≥ 0 | Precio de costo |
| `precio_venta` | decimal | ✅ Sí | ≥ 0 | Precio de venta (OBLIGATORIO) |
| `estado` | boolean | ✅ Sí | true/false | Activo/Inactivo |

### Imágenes
| Campo | Tipo | Requerido | Max Length | Descripción |
|-------|------|-----------|------------|-------------|
| `bucket` | string | ✅ Sí | 100 | "local" o nombre del bucket S3 |
| `ruta` | string | ✅ Sí | - | Ruta relativa de la imagen |
| `nombre_archivo` | string | ❌ No | - | Nombre original del archivo |
| `es_principal` | boolean | ✅ Sí | - | Marca la imagen principal |
| `orden` | int | ✅ Sí | - | Orden de visualización |

---

## 🚀 Endpoint

**URL:** `POST http://localhost:8000/productos/crear-completo`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <token>
```

**Response (201 Created):**
```json
{
  "codigo_producto_id": 123,
  "variantes_creadas": 3,
  "precios_creados": 3,
  "imagenes_creadas": 2,
  "success": true,
  "message": "Producto creado correctamente.",
  "created_at": "2024-01-01T12:00:00+00:00"
}
```

---

## 🔄 Flujo Completo

```
1. Usuario completa wizard (6 pasos)
   ↓
2. Click "Guardar Producto"
   ↓
3. ProductoWizard.handleSubmit() ejecuta
   ↓
4. Genera dataToSend limpio (sin datos_base64)
   ↓
5. productoService.createCompleto(dataToSend)
   ↓
6. axios.post('/productos/crear-completo', data)
   ↓
7. Backend recibe y procesa en transacción
   ├─ Valida estructura
   ├─ Crea CodigoProducto
   ├─ Crea Productos (variantes)
   ├─ Crea Precios
   ├─ Guarda Imágenes
   └─ COMMIT
   ↓
8. Respuesta 201 + datos creados
   ↓
9. Frontend recibe respuesta
   ├─ resetWizard()
   ├─ onClose() (cierra modal)
   └─ Actualiza lista de productos
   ↓
10. ✅ Producto visible en lista
```

---

## 🧪 Testing en Postman

**Paso 1: Obtener token**
```
POST http://localhost:8000/login
Body: { "email": "...", "password": "..." }
Response: { "access_token": "...", "token_type": "bearer" }
```

**Paso 2: Crear producto**
```
POST http://localhost:8000/productos/crear-completo
Authorization: Bearer <token>
Content-Type: application/json
Body: (ver estructura arriba)
```

**Paso 3: Verificar**
```
GET http://localhost:8000/productos
Authorization: Bearer <token>
```

---

## ⚡ Performance

- **Peticiones HTTP:** 1 (antes eran 5+)
- **Tiempo estimado:** 1-2 segundos
- **Transacción atómica:** Sí (ROLLBACK si falla)
- **Datos consistentes:** Garantizado

---

## 📝 Notas

1. **Campos internos NO enviados:**
   - `datos_base64` (se usa solo para preview)
   - `colores` array (se usa solo para generar variantes)
   - `tallas` array (se usa solo para generar variantes)

2. **Validaciones en Backend:**
   - Código único
   - Marca, tipo, material, colores, tallas existen
   - Al menos 1 variante
   - Precios válidos
   - Estados válidos

3. **Manejo de errores:**
   - 400: Validación fallida
   - 409: Código duplicado
   - 500: Error del servidor

---

## ✅ Estado

**Payload:** ✅ Perfectamente sincronizado  
**Endpoint:** ✅ Existe en backend  
**Estructura:** ✅ Valida según backend  
**Listo para:** ✅ Testing end-to-end

