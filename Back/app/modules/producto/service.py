from app.core.exceptions import RegistroActivoNoPuedeEliminarseException, ValidacionDatosException
from datetime import datetime
from io import BytesIO

from sqlalchemy.orm import Session
from sqlalchemy import func
from openpyxl import Workbook, load_workbook
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from fastapi import UploadFile
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch

from app.modules.producto.websocket import manager
from app.modules.codigo_producto.constants import (
    CODIGO_PRODUCTO_NO_EXISTE,
    CODIGO_PRODUCTO_YA_EXISTE,
)
from app.modules.codigo_producto.exceptions import (
    CodigoProductoNoEncontradoException,
    CodigoProductoYaExisteException,
)
from app.modules.codigo_producto.models import CodigoProducto
from app.modules.codigo_producto.repository import CodigoProductoRepository
from app.modules.color.constants import COLOR_NO_EXISTE
from app.modules.color.exceptions import ColorNoEncontradoException
from app.modules.color.repository import ColorRepository
from app.modules.marca.constants import MARCA_NO_EXISTE
from app.modules.marca.exceptions import MarcaNoEncontradaException
from app.modules.marca.repository import MarcaRepository
from app.modules.material.constants import MATERIAL_NO_EXISTE
from app.modules.material.exceptions import MaterialNoEncontradoException
from app.modules.material.repository import MaterialRepository
from app.modules.precio_producto.models import PrecioProducto
from app.modules.producto.constants import (
    PRODUCTO_NO_EXISTE,
    PRODUCTO_YA_EXISTE,
)
from app.modules.producto.exceptions import (
    ProductoNoEncontradoException,
    ProductoYaExisteException,
    StockInsuficienteException
)
from app.modules.producto.models import Producto
from app.modules.producto.repository import ProductoRepository
from app.modules.producto.schemas import (
    ColorInfo,
    MarcaInfo,
    MaterialInfo,
    ProductoCompletoCreate,
    ProductoCreate,
    ProductoListadoResponse,
    ProductoCatalogoResponse,
    ColorCatalogoResponse,
    VarianteCatalogoResponse,
    ProductoColorUpdate,
    VarianteColorUpdate,
    ProductoUpdate,
    TallaInfo,
    TipoCalzadoInfo,
    ProductoDetalleResponse,
    PrecioDetalleResponse,
    ImagenDetalleResponse,
    ProductoCompletoEditarResponse,
    ProductoCompletoUpdate,
    VarianteEditarResponse,
    ImagenEditarResponse,
    VarianteDetalleResponse,
)
from app.modules.producto_imagen.models import ProductoImagen
from app.modules.talla.constants import TALLA_NO_EXISTE
from app.modules.talla.exceptions import TallaNoEncontradaException
from app.modules.talla.repository import TallaRepository
from app.modules.tipo_calzado.constants import TIPO_CALZADO_NO_EXISTE
from app.modules.tipo_calzado.exceptions import TipoCalzadoNoEncontradoException
from app.modules.tipo_calzado.repository import TipoCalzadoRepository


class ProductoService:

    def __init__(self):
        self.repository = ProductoRepository()
        self.codigo_repository = CodigoProductoRepository()
        self.marca_repository = MarcaRepository()
        self.tipo_repository = TipoCalzadoRepository()
        self.material_repository = MaterialRepository()
        self.color_repository = ColorRepository()
        self.talla_repository = TallaRepository()

    def _validar_variantes(self, variantes):
        for idx, v in enumerate(variantes):
            if v.stock_actual < 0:
                raise ValidacionDatosException(f"El stock actual en la fila {idx+1} no puede ser negativo.")
            if v.stock_minimo < 0:
                raise ValidacionDatosException(f"El stock mínimo en la fila {idx+1} no puede ser negativo.")
            if getattr(v, "precio_compra", None) is not None and v.precio_compra < 0:
                raise ValidacionDatosException(f"El precio de compra en la fila {idx+1} no puede ser negativo.")
            if getattr(v, "precio_venta", 1) <= 0:
                raise ValidacionDatosException(f"El precio de venta en la fila {idx+1} debe ser mayor a 0.")

    def get_catalogo(
        self,
        db: Session,
        codigo: str | None = None,
        marca_id: int | None = None,
        marca: str | None = None,
        color_id: int | None = None,
        color: str | None = None,
        material_id: int | None = None,
        material: str | None = None,
        talla_id: int | None = None,
        talla: str | None = None,
        tipo_calzado_id: int | None = None,
        tipo: str | None = None,
    ) -> list[ProductoCatalogoResponse]:
        productos_planos = self.repository.get_all(
            db,
            codigo=codigo,
            marca_id=marca_id,
            marca=marca,
            color_id=color_id,
            color=color,
            material_id=material_id,
            material=material,
            talla_id=talla_id,
            talla=talla,
            tipo_calzado_id=tipo_calzado_id,
            tipo=tipo,
        )

        catalogo_dict = {}

        for p in productos_planos:
            cp_id = p["codigo_producto_id"]
            if cp_id not in catalogo_dict:
                catalogo_dict[cp_id] = {
                    "codigo_producto_id": cp_id,
                    "codigo": p["codigo"],
                    "marca": MarcaInfo(id=p["marca_id"], nombre=p["marca_nombre"]),
                    "tipo_calzado": TipoCalzadoInfo(id=p["tipo_calzado_id"], nombre=p["tipo_calzado_nombre"]),
                    "material": MaterialInfo(id=p["material_id"], nombre=p["material_nombre"]),
                    "descripcion": p["descripcion"],
                    "colores": {}
                }

            colores_dict = catalogo_dict[cp_id]["colores"]
            color_id = p["color_id"]

            if color_id not in colores_dict:
                colores_dict[color_id] = {
                    "color_id": color_id,
                    "color": ColorInfo(id=color_id, nombre=p["color_nombre"]),
                    "imagen_principal": p["imagen_principal"],
                    "variantes": []
                }
            elif p["imagen_principal"] and not colores_dict[color_id]["imagen_principal"]:
                colores_dict[color_id]["imagen_principal"] = p["imagen_principal"]

            variante = VarianteCatalogoResponse(
                id=p["id"],
                talla=TallaInfo(id=p["talla_id"], nombre=p["talla_nombre"]),
                stock_actual=p["stock_actual"],
                stock_minimo=p["stock_minimo"],
                stock_maximo=p["stock_maximo"],
                precio_compra=p["precio_compra"],
                precio_venta=p["precio_venta"],
                estado=p["estado"]
            )
            colores_dict[color_id]["variantes"].append(variante)

        respuestas = []
        for cp_id, cp_data in catalogo_dict.items():
            colores_list = [
                ColorCatalogoResponse(
                    color_id=c_data["color_id"],
                    color=c_data["color"],
                    imagen_principal=c_data["imagen_principal"],
                    variantes=c_data["variantes"]
                )
                for c_data in cp_data["colores"].values()
            ]
            respuestas.append(
                ProductoCatalogoResponse(
                    codigo_producto_id=cp_data["codigo_producto_id"],
                    codigo=cp_data["codigo"],
                    marca=cp_data["marca"],
                    tipo_calzado=cp_data["tipo_calzado"],
                    material=cp_data["material"],
                    descripcion=cp_data["descripcion"],
                    colores=colores_list
                )
            )

        return respuestas

    def exportar_excel(
        self,
        db: Session,
        codigo: str | None = None,
        marca_id: int | None = None,
        marca: str | None = None,
        color_id: int | None = None,
        color: str | None = None,
        material_id: int | None = None,
        material: str | None = None,
        talla_id: int | None = None,
        talla: str | None = None,
        tipo_calzado_id: int | None = None,
        tipo: str | None = None,
    ) -> BytesIO:
        productos_planos = self.repository.get_all(
            db,
            codigo=codigo,
            marca_id=marca_id,
            marca=marca,
            color_id=color_id,
            color=color,
            material_id=material_id,
            material=material,
            talla_id=talla_id,
            talla=talla,
            tipo_calzado_id=tipo_calzado_id,
            tipo=tipo,
        )

        wb = Workbook()
        ws = wb.active
        ws.title = "Productos"

        headers = [
            "Código", "Marca", "Tipo", "Material", "Color", 
            "Talla", "Stock", "Precio Venta", "Estado"
        ]
        ws.append(headers)

        for p in productos_planos:
            ws.append([
                p["codigo"],
                p["marca_nombre"],
                p["tipo_calzado_nombre"],
                p["material_nombre"],
                p["color_nombre"],
                p["talla_nombre"],
                p["stock_actual"],
                p["precio_venta"],
                "Activo" if p["estado"] else "Inactivo"
            ])

        buffer = BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        return buffer

    def exportar_pdf(
        self,
        db: Session,
        codigo: str | None = None,
        marca_id: int | None = None,
        marca: str | None = None,
        color_id: int | None = None,
        color: str | None = None,
        material_id: int | None = None,
        material: str | None = None,
        talla_id: int | None = None,
        talla: str | None = None,
        tipo_calzado_id: int | None = None,
        tipo: str | None = None,
    ) -> BytesIO:
        productos_planos = self.repository.get_all(
            db,
            codigo=codigo,
            marca_id=marca_id,
            marca=marca,
            color_id=color_id,
            color=color,
            material_id=material_id,
            material=material,
            talla_id=talla_id,
            talla=talla,
            tipo_calzado_id=tipo_calzado_id,
            tipo=tipo,
        )

        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=landscape(letter))
        elements = []
        styles = getSampleStyleSheet()

        # Cabecera genérica fácil de cambiar
        nombre_negocio = "MI NEGOCIO S.A."
        titulo_reporte = "Catálogo General de Productos"
        fecha_str = datetime.now().strftime("%Y-%m-%d %H:%M")

        elements.append(Paragraph(f"<b>{nombre_negocio}</b>", styles['Heading1']))
        elements.append(Paragraph(f"{titulo_reporte}", styles['Heading2']))
        elements.append(Paragraph(f"Fecha de generación: {fecha_str}", styles['Normal']))
        elements.append(Paragraph(f"Total de productos: {len(productos_planos)}", styles['Normal']))
        elements.append(Spacer(1, 0.25 * inch))

        # Tabla
        data = [[
            "Código", "Marca", "Tipo", "Material", "Color", 
            "Talla", "Stock", "Precio Venta", "Estado"
        ]]

        for p in productos_planos:
            data.append([
                p["codigo"],
                p["marca_nombre"],
                p["tipo_calzado_nombre"],
                p["material_nombre"],
                p["color_nombre"],
                p["talla_nombre"],
                str(p["stock_actual"]),
                f"${p['precio_venta']:.2f}",
                "Activo" if p["estado"] else "Inactivo"
            ])

        t = Table(data, repeatRows=1)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#2C3E50")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#ECF0F1")),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 1, colors.white),
        ]))
        elements.append(t)

        def add_page_number(canvas, doc):
            page_num = canvas.getPageNumber()
            text = f"Página {page_num}"
            canvas.drawRightString(10.5*inch, 0.5*inch, text)

        doc.build(elements, onFirstPage=add_page_number, onLaterPages=add_page_number)
        buffer.seek(0)
        return buffer

    def generar_plantilla_importacion(self) -> BytesIO:
        wb = Workbook()
        ws = wb.active
        ws.title = "Plantilla Importacion"

        headers = [
            "Código", "Marca", "Tipo", "Material", "Color", 
            "Talla", "Stock", "Precio Venta", "Descripción"
        ]
        ws.append(headers)
        
        ws.append([
            "PROD-001", "Nike", "Urbano", "Cuero", "Blanco", 
            "40", 100, 150.00, "Zapatilla de prueba"
        ])
        
        buffer = BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        return buffer

    async def previa_importacion(self, db: Session, file: UploadFile) -> PreviaImportacionResponse:
        content = await file.read()
        wb = load_workbook(filename=BytesIO(content), data_only=True)
        ws = wb.active

        filas = []
        validos = 0
        errores = 0

        for idx, row in enumerate(ws.iter_rows(min_row=2, values_only=True), start=2):
            if all(cell is None for cell in row):
                continue
            
            codigo, marca, tipo, material, color, talla, stock, precio, descripcion = (list(row)[:9] + [None]*9)[:9]

            fila_errores = []

            codigo_str = str(codigo).strip() if codigo is not None else None
            marca_str = str(marca).strip() if marca is not None else None
            tipo_str = str(tipo).strip() if tipo is not None else None
            material_str = str(material).strip() if material is not None else None
            color_str = str(color).strip() if color is not None else None
            talla_str = str(talla).strip() if talla is not None else None
            stock_str = str(stock).strip() if stock is not None else None
            precio_str = str(precio).strip() if precio is not None else None
            descripcion_str = str(descripcion).strip() if descripcion is not None else None

            if not codigo_str: fila_errores.append("Código es obligatorio.")
            else:
                existente = self.codigo_repository.get_by_codigo(db, codigo_str)
                if existente:
                    fila_errores.append(f"Código '{codigo_str}' ya existe en BD.")
            
            if not marca_str: fila_errores.append("Marca es obligatoria.")
            else:
                if not self.marca_repository.get_by_nombre(db, marca_str):
                    fila_errores.append(f"Marca '{marca_str}' no existe.")

            if not tipo_str: fila_errores.append("Tipo es obligatorio.")
            else:
                if not self.tipo_repository.get_by_nombre(db, tipo_str):
                    fila_errores.append(f"Tipo '{tipo_str}' no existe.")

            if not material_str: fila_errores.append("Material es obligatorio.")
            else:
                if not self.material_repository.get_by_nombre(db, material_str):
                    fila_errores.append(f"Material '{material_str}' no existe.")

            if not color_str: fila_errores.append("Color es obligatorio.")
            else:
                if not self.color_repository.get_by_nombre(db, color_str):
                    fila_errores.append(f"Color '{color_str}' no existe.")

            if not talla_str: fila_errores.append("Talla es obligatoria.")
            else:
                if not self.talla_repository.get_by_nombre(db, talla_str):
                    fila_errores.append(f"Talla '{talla_str}' no existe.")

            if not stock_str: fila_errores.append("Stock es obligatorio.")
            else:
                try:
                    s = int(float(stock_str))
                    if s < 0: fila_errores.append("Stock debe ser >= 0.")
                except ValueError:
                    fila_errores.append("Stock debe ser un número entero.")

            if not precio_str: fila_errores.append("Precio Venta es obligatorio.")
            else:
                try:
                    p = float(precio_str)
                    if p < 0: fila_errores.append("Precio debe ser >= 0.")
                except ValueError:
                    fila_errores.append("Precio debe ser un número válido.")
            
            es_valido = len(fila_errores) == 0
            if es_valido:
                validos += 1
            else:
                errores += 1

            filas.append(FilaPrevia(
                fila=idx,
                codigo=codigo_str,
                marca=marca_str,
                tipo=tipo_str,
                material=material_str,
                color=color_str,
                talla=talla_str,
                stock=stock_str,
                precio=precio_str,
                descripcion=descripcion_str,
                valido=es_valido,
                errores=fila_errores
            ))
            
        return PreviaImportacionResponse(
            total=len(filas),
            validos=validos,
            errores=errores,
            filas=filas
        )

    def confirmar_importacion(self, db: Session, filas: list[FilaPrevia]):
        productos_a_crear = {}
        for fila in filas:
            if not fila.valido: continue
            
            marca = self.marca_repository.get_by_nombre(db, fila.marca)
            tipo = self.tipo_repository.get_by_nombre(db, fila.tipo)
            material = self.material_repository.get_by_nombre(db, fila.material)
            color = self.color_repository.get_by_nombre(db, fila.color)
            talla = self.talla_repository.get_by_nombre(db, fila.talla)
            
            codigo = fila.codigo
            if codigo not in productos_a_crear:
                productos_a_crear[codigo] = {
                    "marca_id": marca.id,
                    "tipo_calzado_id": tipo.id,
                    "material_id": material.id,
                    "descripcion": fila.descripcion or "",
                    "variantes": []
                }
            
            productos_a_crear[codigo]["variantes"].append(
                VarianteCreate(
                    color_id=color.id,
                    talla_id=talla.id,
                    stock_actual=int(float(fila.stock)),
                    precio_venta=float(fila.precio)
                )
            )

        # Envolver en transacción
        try:
            creados = 0
            for codigo, props in productos_a_crear.items():
                payload = ProductoCompletoCreate(
                    codigo=codigo,
                    marca_id=props["marca_id"],
                    tipo_calzado_id=props["tipo_calzado_id"],
                    material_id=props["material_id"],
                    descripcion=props["descripcion"],
                    variantes=props["variantes"],
                    force=True
                )
                self.create_completo(db, payload)
                creados += 1
            db.commit()
            return {"success": True, "creados": creados}
        except Exception as e:
            db.rollback()
            raise e

    def get_papelera(
        self,
        db: Session,
        codigo: str | None = None,
        marca_id: int | None = None,
        marca: str | None = None,
        color_id: int | None = None,
        color: str | None = None,
        material_id: int | None = None,
        material: str | None = None,
        talla_id: int | None = None,
        talla: str | None = None,
        tipo_calzado_id: int | None = None,
        tipo: str | None = None,
    ) -> list[ProductoListadoResponse]:
        productos = self.repository.get_papelera(
            db,
            codigo=codigo,
            marca_id=marca_id,
            marca=marca,
            color_id=color_id,
            color=color,
            material_id=material_id,
            material=material,
            talla_id=talla_id,
            talla=talla,
            tipo_calzado_id=tipo_calzado_id,
            tipo=tipo,
        )

        return [
            ProductoListadoResponse(
                id=producto["id"],
                codigo_producto_id=producto["codigo_producto_id"],
                codigo=producto["codigo"],
                descripcion=producto["descripcion"],
                marca=MarcaInfo(
                    id=producto["marca_id"],
                    nombre=producto["marca_nombre"],
                ),
                tipo_calzado=TipoCalzadoInfo(
                    id=producto["tipo_calzado_id"],
                    nombre=producto["tipo_calzado_nombre"],
                ),
                material=MaterialInfo(
                    id=producto["material_id"],
                    nombre=producto["material_nombre"],
                ),
                color=ColorInfo(
                    id=producto["color_id"],
                    nombre=producto["color_nombre"],
                ),
                talla=TallaInfo(
                    id=producto["talla_id"],
                    nombre=producto["talla_nombre"],
                ),
                stock_actual=producto["stock_actual"],
                stock_minimo=producto["stock_minimo"],
                stock_maximo=producto["stock_maximo"],
                precio_compra=producto["precio_compra"],
                precio_venta=producto["precio_venta"],
                imagen_principal=producto["imagen_principal"],
                estado=producto["estado"],
                created_at=producto["created_at"],
                updated_at=producto["updated_at"],
            )
            for producto in productos
        ]

    def get_dependencias(self, db: Session, id: int) -> dict:
        return self.repository.get_dependencias(db, id)

    def desactivar(self, db: Session, id: int):
        item = self.repository.get_by_id(db, id)
        if item:
            item.estado = False
            item.deleted_at = datetime.now()
            db.commit()
            db.refresh(item)
        return item

    def recuperar(self, db: Session, id: int):
        item = self.repository.get_by_id_papelera(db, id)
        if item:
            item.estado = True
            item.deleted_at = None
            db.commit()
            db.refresh(item)
        return item

    def get_all(
        self,
        db: Session,
        codigo: str | None = None,
        marca_id: int | None = None,
        marca: str | None = None,
        color_id: int | None = None,
        color: str | None = None,
        material_id: int | None = None,
        material: str | None = None,
        talla_id: int | None = None,
        talla: str | None = None,
        tipo_calzado_id: int | None = None,
        tipo: str | None = None,
    ) -> list[ProductoListadoResponse]:

        productos = self.repository.get_all(
            db,
            codigo=codigo,
            marca_id=marca_id,
            marca=marca,
            color_id=color_id,
            color=color,
            material_id=material_id,
            material=material,
            talla_id=talla_id,
            talla=talla,
            tipo_calzado_id=tipo_calzado_id,
            tipo=tipo,
        )

        return [
            ProductoListadoResponse(
                id=producto["id"],
                codigo_producto_id=producto["codigo_producto_id"],
                codigo=producto["codigo"],
                descripcion=producto["descripcion"],
                marca=MarcaInfo(
                    id=producto["marca_id"],
                    nombre=producto["marca_nombre"],
                ),
                tipo_calzado=TipoCalzadoInfo(
                    id=producto["tipo_calzado_id"],
                    nombre=producto["tipo_calzado_nombre"],
                ),
                material=MaterialInfo(
                    id=producto["material_id"],
                    nombre=producto["material_nombre"],
                ),
                color=ColorInfo(
                    id=producto["color_id"],
                    nombre=producto["color_nombre"],
                ),
                talla=TallaInfo(
                    id=producto["talla_id"],
                    nombre=producto["talla_nombre"],
                ),
                stock_actual=producto["stock_actual"],
                stock_minimo=producto["stock_minimo"],
                stock_maximo=producto["stock_maximo"],
                precio_compra=producto["precio_compra"],
                precio_venta=producto["precio_venta"],
                imagen_principal=producto["imagen_principal"],
                estado=producto["estado"],
                created_at=producto["created_at"],
                updated_at=producto["updated_at"],
            )
            for producto in productos
        ]
    def get_detalle(
        self,
        db: Session,
        producto_id: int,
    ) -> ProductoDetalleResponse:

        producto = self.repository.get_detalle(
            db,
            producto_id,
        )

        if not producto:
            producto = self.repository.get_by_id_papelera(db, producto_id)
        if not producto:
            raise ProductoNoEncontradoException(
                PRODUCTO_NO_EXISTE
            )

        precio = next(
            (
                p
                for p in producto.precios
                if p.estado
            ),
            None,
        )

        todas_variantes = self.repository.get_by_codigo_producto_id(
            db,
            producto.codigo_producto_id,
        )

        variantes_response = []
        for v in todas_variantes:
            v_precio = next((p for p in v.precios if p.estado), None)
            variantes_response.append(
                VarianteDetalleResponse(
                    id=v.id,
                    color=ColorInfo(
                        id=v.color.id,
                        nombre=v.color.nombre,
                        codigo_hex=v.color.codigo_hex,
                    ),
                    talla=TallaInfo(
                        id=v.talla.id,
                        nombre=v.talla.nombre,
                    ),
                    stock_actual=v.stock_actual,
                    stock_minimo=v.stock_minimo,
                    stock_maximo=v.stock_maximo,
                    precio=(
                        PrecioDetalleResponse(
                            precio_compra=v_precio.precio_compra,
                            precio_venta=v_precio.precio_venta,
                        )
                        if v_precio else None
                    ),
                    estado=v.estado,
                )
            )

        producto_principal = todas_variantes[0] if todas_variantes else producto

        imagen_principal = next(
            (
                img.ruta
                for img in producto_principal.imagenes
                if img.es_principal
            ),
            None,
        )

        return ProductoDetalleResponse(

            id=producto.id,

            codigo=producto.codigo_producto.codigo,

            descripcion=producto.descripcion,

            marca=MarcaInfo(
                id=producto.codigo_producto.marca.id,
                nombre=producto.codigo_producto.marca.nombre,
            ),

            tipo_calzado=TipoCalzadoInfo(
                id=producto.tipo_calzado.id,
                nombre=producto.tipo_calzado.nombre,
            ),

            material=MaterialInfo(
                id=producto.material.id,
                nombre=producto.material.nombre,
            ),

            color=ColorInfo(
                id=producto.color.id,
                nombre=producto.color.nombre,
                codigo_hex=producto.color.codigo_hex,
            ),

            talla=TallaInfo(
                id=producto.talla.id,
                nombre=producto.talla.nombre,
            ),

            stock_actual=producto.stock_actual,
            stock_minimo=producto.stock_minimo,
            stock_maximo=producto.stock_maximo,

            precio=(
                PrecioDetalleResponse(
                    precio_compra=precio.precio_compra,
                    precio_venta=precio.precio_venta,
                )
                if precio
                else None
            ),

            imagen_principal=imagen_principal,

            imagenes=[
                ImagenDetalleResponse(
                    id=img.id,
                    bucket=img.bucket,
                    ruta=img.ruta,
                    nombre_archivo=img.nombre_archivo,
                    es_principal=img.es_principal,
                    orden=img.orden,
                )
                for img in producto_principal.imagenes
            ],
            
            variantes=variantes_response,

            estado=producto.estado,

            created_at=producto.created_at,

            updated_at=producto.updated_at,
    )    
    def get_by_id(
        self,
        db: Session,
        producto_id: int,
    ) -> Producto | None:

        return self.repository.get_by_id(
            db,
            producto_id,
        )

    def create(
        self,
        db: Session,
        data: ProductoCreate,
    ) -> Producto:

        if not self.codigo_repository.get_by_id(db, data.codigo_producto_id):
            raise CodigoProductoNoEncontradoException(
                CODIGO_PRODUCTO_NO_EXISTE
            )

        if not self.tipo_repository.get_by_id(db, data.tipo_calzado_id):
            raise TipoCalzadoNoEncontradoException(
                TIPO_CALZADO_NO_EXISTE
            )

        if not self.material_repository.get_by_id(db, data.material_id):
            raise MaterialNoEncontradoException(
                MATERIAL_NO_EXISTE
            )

        if not self.color_repository.get_by_id(db, data.color_id):
            raise ColorNoEncontradoException(
                COLOR_NO_EXISTE
            )

        if not self.talla_repository.get_by_id(db, data.talla_id):
            raise TallaNoEncontradaException(
                TALLA_NO_EXISTE
            )

        if self.repository.exists(
            db,
            data.codigo_producto_id,
            data.color_id,
            data.talla_id,
        ):
            raise ProductoYaExisteException(
                PRODUCTO_YA_EXISTE
            )

        producto = Producto(**data.model_dump())

        return self.repository.create(
            db,
            producto,
        )
    def get_editar_completo(
        self,
        db: Session,
        codigo_producto_id: int,
    ) -> ProductoCompletoEditarResponse:

        codigo_producto = self.codigo_repository.get_by_id(
            db,
            codigo_producto_id,
        )

        if not codigo_producto:
            raise ProductoNoEncontradoException(
                PRODUCTO_NO_EXISTE
            )

        productos = self.repository.get_by_codigo_producto_id(
            db,
            codigo_producto_id,
        )

        if not productos:
            raise ProductoNoEncontradoException(
                PRODUCTO_NO_EXISTE
            )

        primer_producto = productos[0]

        variantes = []

        for producto in productos:

            precio = next(
                (
                    p
                    for p in producto.precios
                    if p.estado
                ),
                None,
            )

            variantes.append(
                VarianteEditarResponse(
                    id=producto.id,
                    color_id=producto.color_id,
                    talla_id=producto.talla_id,
                    stock_actual=producto.stock_actual,
                    stock_minimo=producto.stock_minimo,
                    stock_maximo=producto.stock_maximo,
                    precio_compra=(
                        precio.precio_compra
                        if precio
                        else None
                    ),
                    precio_venta=(
                        precio.precio_venta
                        if precio
                        else 0
                    ),
                )
            )

        imagenes = [
            ImagenEditarResponse(
                id=imagen.id,
                bucket=imagen.bucket,
                ruta=imagen.ruta,
                nombre_archivo=imagen.nombre_archivo,
                es_principal=imagen.es_principal,
                orden=imagen.orden,
            )
            for imagen in primer_producto.imagenes
        ]

        return ProductoCompletoEditarResponse(
            codigo_producto_id=codigo_producto.id,
            codigo=codigo_producto.codigo,
            marca_id=codigo_producto.marca_id,
            tipo_calzado_id=primer_producto.tipo_calzado_id,
            material_id=primer_producto.material_id,
            descripcion=primer_producto.descripcion,
            variantes=variantes,
            imagenes=imagenes,
        )
    def update_completo(
        self,
        db: Session,
        codigo_producto_id: int,
        data: ProductoCompletoUpdate,
    ):
        self._validar_variantes(data.variantes)
        """
        Edita completamente un producto.
        La estrategia consiste en actualizar el código y recrear todas las
        variantes, precios e imágenes.
        """

        try:

            codigo_producto = self.codigo_repository.get_by_id(
                db,
                codigo_producto_id,
            )

            if not codigo_producto:
                raise ProductoNoEncontradoException(
                    PRODUCTO_NO_EXISTE
                )

            if not self.marca_repository.get_by_id(
                db,
                data.marca_id,
            ):
                raise MarcaNoEncontradaException(
                    MARCA_NO_EXISTE
                )

            if not self.tipo_repository.get_by_id(
                db,
                data.tipo_calzado_id,
            ):
                raise TipoCalzadoNoEncontradoException(
                    TIPO_CALZADO_NO_EXISTE
                )

            if not self.material_repository.get_by_id(
                db,
                data.material_id,
            ):
                raise MaterialNoEncontradoException(
                    MATERIAL_NO_EXISTE
                )

            variantes_unicas = set()
            cache_colores = {}
            cache_tallas = {}

            for variante in data.variantes:
                clave = (
                    variante.color_id,
                    variante.talla_id,
                )

                if clave in variantes_unicas:
                    raise ProductoYaExisteException(
                        PRODUCTO_YA_EXISTE
                    )

                variantes_unicas.add(clave)

                if variante.color_id not in cache_colores:
                    color_obj = self.color_repository.get_by_id(db, variante.color_id)
                    if not color_obj:
                        raise ColorNoEncontradoException(COLOR_NO_EXISTE)
                    cache_colores[variante.color_id] = color_obj

                if variante.talla_id not in cache_tallas:
                    talla_obj = self.talla_repository.get_by_id(db, variante.talla_id)
                    if not talla_obj:
                        raise TallaNoEncontradaException(TALLA_NO_EXISTE)
                    cache_tallas[variante.talla_id] = talla_obj

            exacto = self.codigo_repository.get_by_codigo_y_marca(db, data.codigo, data.marca_id)
            if exacto and exacto.id != codigo_producto.id:
                marca_obj = self.marca_repository.get_by_id(db, data.marca_id)
                marca_nombre = marca_obj.nombre if marca_obj else "la marca especificada"
                from app.core.exceptions import CodigoProductoDuplicadoException
                raise CodigoProductoDuplicadoException(
                    f"El código '{data.codigo}' ya existe para la marca '{marca_nombre}'."
                )

            if data.codigo != codigo_producto.codigo:
                otros = self.codigo_repository.get_all_by_codigo(db, data.codigo)
                otros_filtrados = [o for o in otros if o.id != codigo_producto.id and o.marca_id != data.marca_id]
                if otros_filtrados and not getattr(data, 'force', False):
                    marca_conflicto_obj = self.marca_repository.get_by_id(db, otros_filtrados[0].marca_id)
                    marca_conflicto_nombre = marca_conflicto_obj.nombre if marca_conflicto_obj else "Otra marca"
                    marca_destino_obj = self.marca_repository.get_by_id(db, data.marca_id)
                    marca_destino_nombre = marca_destino_obj.nombre if marca_destino_obj else "la marca especificada"
                    from app.core.exceptions import CodigoProductoOtraMarcaWarning
                    raise CodigoProductoOtraMarcaWarning(
                        f"El código '{data.codigo}' ya se encuentra registrado para la marca '{marca_conflicto_nombre}'.",
                        codigo=data.codigo,
                        marca_conflicto=marca_conflicto_nombre,
                        marca_destino=marca_destino_nombre
                    )

            codigo_producto.codigo = data.codigo
            codigo_producto.marca_id = data.marca_id

            self.repository.save_codigo_producto(
                db,
                codigo_producto,
            )

            # Obtenemos los productos actuales para este codigo (sin N+1)
            productos_existentes = self.repository.get_by_codigo_producto_id(db, codigo_producto.id)
            mapa_existentes = {(p.color_id, p.talla_id): p for p in productos_existentes}

            variantes_entrantes_claves = set()
            productos_modificados_o_creados = []

            for variante in data.variantes:
                clave = (variante.color_id, variante.talla_id)
                variantes_entrantes_claves.add(clave)

                if clave in mapa_existentes:
                    producto = mapa_existentes[clave]
                    # Upsert (Actualización in-place)
                    producto.tipo_calzado_id = data.tipo_calzado_id
                    producto.material_id = data.material_id
                    producto.descripcion = data.descripcion
                    producto.stock_actual = variante.stock_actual
                    producto.stock_minimo = variante.stock_minimo
                    producto.stock_maximo = variante.stock_maximo
                    producto.estado = variante.estado
                    
                    # Logica de Precio: 
                    precio_actual = None
                    for p in producto.precios:
                        if p.estado and p.vigente_hasta is None:
                            precio_actual = p
                            break
                            
                    if not precio_actual or precio_actual.precio_compra != variante.precio_compra or precio_actual.precio_venta != variante.precio_venta:
                        if precio_actual:
                            precio_actual.vigente_hasta = datetime.now()
                            precio_actual.estado = False
                            
                        nuevo_precio = PrecioProducto(
                            precio_compra=variante.precio_compra,
                            precio_venta=variante.precio_venta,
                            vigente_desde=datetime.now(),
                            estado=True,
                        )
                        producto.precios.append(nuevo_precio)
                        
                    productos_modificados_o_creados.append(producto)
                else:
                    # Insert (Nuevo)
                    producto = Producto(
                        codigo_producto_id=codigo_producto.id,
                        tipo_calzado_id=data.tipo_calzado_id,
                        material_id=data.material_id,
                        color_id=variante.color_id,
                        talla_id=variante.talla_id,
                        descripcion=data.descripcion,
                        stock_actual=variante.stock_actual,
                        stock_minimo=variante.stock_minimo,
                        stock_maximo=variante.stock_maximo,
                        estado=variante.estado,
                    )
                    
                    nuevo_precio = PrecioProducto(
                        precio_compra=variante.precio_compra,
                        precio_venta=variante.precio_venta,
                        vigente_desde=datetime.now(),
                        estado=True,
                    )
                    producto.precios.append(nuevo_precio)
                    db.add(producto)
                    productos_modificados_o_creados.append(producto)
                    
            # Las que no vinieron en el payload, se desactivan logicamente
            for clave, producto in mapa_existentes.items():
                if clave not in variantes_entrantes_claves:
                    producto.estado = False

            db.commit()

            return {
                "codigo_producto_id": codigo_producto.id,
                "producto_principal_id": productos_modificados_o_creados[0].id if productos_modificados_o_creados else None,
                "variantes_creadas": len(productos_modificados_o_creados),
                "precios_creados": len(productos_modificados_o_creados),
                "imagenes_creadas": 0,
                "success": True,
                "message": "Producto actualizado correctamente.",
                "created_at": datetime.now(),
            }

        except Exception:

            self.repository.rollback(
                db,
            )

            raise
    def update(
        self,
        db: Session,
        producto_id: int,
        data: ProductoUpdate,
    ) -> Producto:

        producto = self.repository.get_by_id(
            db,
            producto_id,
        )

        if not producto:
            producto = self.repository.get_by_id_papelera(db, producto_id)
        if not producto:
            raise ProductoNoEncontradoException(
                PRODUCTO_NO_EXISTE
            )

        update_data = data.model_dump(
            exclude_unset=True
        )

        for campo, valor in update_data.items():
            setattr(
                producto,
                campo,
                valor,
            )

        return self.repository.update(
            db,
            producto,
        )

    def delete(
        self,
        db: Session,
        producto_id: int,
    ) -> None:

        producto = self.repository.get_by_id(
            db,
            producto_id,
        )

        if not producto:
            producto = self.repository.get_by_id_papelera(db, producto_id)
        if not producto:
            producto = self.repository.get_by_id_papelera(db, producto_id if 'producto_id' in locals() else id)
        if not producto:
            raise ProductoNoEncontradoException(
                PRODUCTO_NO_EXISTE
            )

        if locals().get('item') and getattr(locals()['item'], 'estado', False) or (locals().get('producto') and getattr(locals().get('producto'), 'estado', False)):
            raise RegistroActivoNoPuedeEliminarseException('No se puede eliminar físicamente un registro activo. Envíelo a la papelera primero.')
        if producto.estado == True:
            raise RegistroActivoNoPuedeEliminarseException(
                "No se puede eliminar un registro activo. Desactívalo primero."
            )

        self.repository.delete(db, producto)
    async def incrementar_stock(
        self,
        db: Session,
        producto_id: int,
    ):
        stock = self.repository.incrementar_stock(
            db,
            producto_id,
        )

        if stock is None:
            raise ProductoNoEncontradoException(
                PRODUCTO_NO_EXISTE
            )

        await manager.broadcast_stock(
            producto_id,
            stock,
        )       

        return {
            "producto_id": producto_id,
            "stock_actual": stock,
        }
    async def decrementar_stock(
        self,
        db: Session,
        producto_id: int,
    ):
        stock = self.repository.decrementar_stock(
            db,
            producto_id,
        )

        if stock is None:
            # Check if product exists but has 0 stock
            prod = self.repository.get_by_id(db, producto_id)
            if not prod:
                raise ProductoNoEncontradoException(
                    PRODUCTO_NO_EXISTE
                )
            else:
                raise StockInsuficienteException(
                    "No es posible disminuir el inventario porque el stock ya es cero."
                )
        await manager.broadcast_stock(
            producto_id,
            stock,
        )       

        return {
            "producto_id": producto_id,
            "stock_actual": stock,
        }
    def create_completo(
        self,
        db: Session,
        data: ProductoCompletoCreate,
    ) -> dict:
        
        self._validar_variantes(data.variantes)
        """
        Crea un producto completo en una sola transaccion.
        """

        try:
            if not self.marca_repository.get_by_id(
                db,
                data.marca_id,
            ):
                raise MarcaNoEncontradaException(
                    MARCA_NO_EXISTE
                )

            if not self.tipo_repository.get_by_id(
                db,
                data.tipo_calzado_id,
            ):
                raise TipoCalzadoNoEncontradoException(
                    TIPO_CALZADO_NO_EXISTE
                )

            if not self.material_repository.get_by_id(
                db,
                data.material_id,
            ):
                raise MaterialNoEncontradoException(
                    MATERIAL_NO_EXISTE
                )

            variantes_unicas = set()
            cache_colores = {}
            cache_tallas = {}

            for variante in data.variantes:
                clave_variante = (
                    variante.color_id,
                    variante.talla_id,
                )

                if clave_variante in variantes_unicas:
                    raise ProductoYaExisteException(
                        PRODUCTO_YA_EXISTE
                    )

                variantes_unicas.add(clave_variante)

                if variante.color_id not in cache_colores:
                    color_obj = self.color_repository.get_by_id(db, variante.color_id)
                    if not color_obj:
                        raise ColorNoEncontradoException(COLOR_NO_EXISTE)
                    cache_colores[variante.color_id] = color_obj

                if variante.talla_id not in cache_tallas:
                    talla_obj = self.talla_repository.get_by_id(db, variante.talla_id)
                    if not talla_obj:
                        raise TallaNoEncontradaException(TALLA_NO_EXISTE)
                    cache_tallas[variante.talla_id] = talla_obj

            exacto = self.codigo_repository.get_by_codigo_y_marca(db, data.codigo, data.marca_id)
            if exacto:
                marca_obj = self.marca_repository.get_by_id(db, data.marca_id)
                marca_nombre = marca_obj.nombre if marca_obj else "la marca especificada"
                from app.core.exceptions import CodigoProductoDuplicadoException
                raise CodigoProductoDuplicadoException(
                    f"El código '{data.codigo}' ya existe para la marca '{marca_nombre}'."
                )

            otros = self.codigo_repository.get_all_by_codigo(db, data.codigo)
            if otros and not getattr(data, 'force', False):
                marca_conflicto_obj = self.marca_repository.get_by_id(db, otros[0].marca_id)
                marca_conflicto_nombre = marca_conflicto_obj.nombre if marca_conflicto_obj else "Otra marca"
                marca_destino_obj = self.marca_repository.get_by_id(db, data.marca_id)
                marca_destino_nombre = marca_destino_obj.nombre if marca_destino_obj else "la marca especificada"
                from app.core.exceptions import CodigoProductoOtraMarcaWarning
                raise CodigoProductoOtraMarcaWarning(
                    f"El código '{data.codigo}' ya se encuentra registrado para la marca '{marca_conflicto_nombre}'.",
                    codigo=data.codigo,
                    marca_conflicto=marca_conflicto_nombre,
                    marca_destino=marca_destino_nombre
                )

            codigo_producto = CodigoProducto(
                marca_id=data.marca_id,
                codigo=data.codigo,
                estado=True,
            )

            db.add(codigo_producto)

            productos = []

            for variante in data.variantes:
                producto = Producto(
                    codigo_producto=codigo_producto,
                    tipo_calzado_id=data.tipo_calzado_id,
                    material_id=data.material_id,
                    color_id=variante.color_id,
                    talla_id=variante.talla_id,
                    descripcion=data.descripcion,
                    stock_actual=variante.stock_actual,
                    stock_minimo=variante.stock_minimo,
                    stock_maximo=variante.stock_maximo,
                    estado=variante.estado,
                )

                nuevo_precio = PrecioProducto(
                    precio_compra=variante.precio_compra,
                    precio_venta=variante.precio_venta,
                    vigente_desde=datetime.now(),
                    estado=True,
                )
                producto.precios.append(nuevo_precio)
                db.add(producto)
                productos.append(producto)

            db.commit()

            return {
                "codigo_producto_id": codigo_producto.id,
                "producto_principal_id": productos[0].id if productos else None,
                "variantes_creadas": len(productos),
                "precios_creados": len(productos),
                "imagenes_creadas": 0,
                "success": True,
                "message": "Producto creado correctamente.",
                "created_at": datetime.now(),
            }

        except Exception:
            db.rollback()
            raise

    def desactivar_color(self, db: Session, codigo_producto_id: int, color_id: int):
        variantes = db.query(Producto).filter(
            Producto.codigo_producto_id == codigo_producto_id,
            Producto.color_id == color_id,
            Producto.estado == True
        ).all()
        for v in variantes:
            v.estado = False
            v.deleted_at = datetime.now()
        db.commit()
        return {'msg': f'{len(variantes)} variantes desactivadas'}

    def recuperar_color(self, db: Session, codigo_producto_id: int, color_id: int):
        variantes = db.query(Producto).filter(
            Producto.codigo_producto_id == codigo_producto_id,
            Producto.color_id == color_id,
            Producto.estado == False
        ).all()
        for v in variantes:
            v.estado = True
            v.deleted_at = None
        db.commit()
        return {'msg': f'{len(variantes)} variantes recuperadas'}

    def delete_color(self, db: Session, codigo_producto_id: int, color_id: int) -> None:
        variantes = db.query(Producto).filter(
            Producto.codigo_producto_id == codigo_producto_id,
            Producto.color_id == color_id
        ).all()

        if not variantes:
            raise ProductoNoEncontradoException(PRODUCTO_NO_EXISTE)

        for v in variantes:
            if v.estado == True:
                raise RegistroActivoNoPuedeEliminarseException(
                    "No se puede eliminar un registro activo. Desactívalo primero."
                )

        for v in variantes:
            self.repository.delete(db, v)

    def update_por_color(
        self,
        db: Session,
        codigo_producto_id: int,
        color_id: int,
        data: ProductoColorUpdate,
    ):
        self._validar_variantes(data.variantes)
        codigo_producto = self.codigo_repository.get_by_id(db, codigo_producto_id)
        if not codigo_producto:
            raise ProductoNoEncontradoException(PRODUCTO_NO_EXISTE)
        
        exacto = self.codigo_repository.get_by_codigo_y_marca(db, data.codigo, data.marca_id)
        if exacto and exacto.id != codigo_producto.id:
            marca_obj = self.marca_repository.get_by_id(db, data.marca_id)
            marca_nombre = marca_obj.nombre if marca_obj else "la marca especificada"
            from app.core.exceptions import CodigoProductoDuplicadoException
            raise CodigoProductoDuplicadoException(
                f"El código '{data.codigo}' ya existe para la marca '{marca_nombre}'."
            )

        if data.codigo != codigo_producto.codigo:
            otros = self.codigo_repository.get_all_by_codigo(db, data.codigo)
            otros_filtrados = [o for o in otros if o.id != codigo_producto.id and o.marca_id != data.marca_id]
            if otros_filtrados and not getattr(data, 'force', False):
                marca_conflicto_obj = self.marca_repository.get_by_id(db, otros_filtrados[0].marca_id)
                marca_conflicto_nombre = marca_conflicto_obj.nombre if marca_conflicto_obj else "Otra marca"
                marca_destino_obj = self.marca_repository.get_by_id(db, data.marca_id)
                marca_destino_nombre = marca_destino_obj.nombre if marca_destino_obj else "la marca especificada"
                from app.core.exceptions import CodigoProductoOtraMarcaWarning
                raise CodigoProductoOtraMarcaWarning(
                    f"El código '{data.codigo}' ya se encuentra registrado para la marca '{marca_conflicto_nombre}'.",
                    codigo=data.codigo,
                    marca_conflicto=marca_conflicto_nombre,
                    marca_destino=marca_destino_nombre
                )
            
        codigo_producto.codigo = data.codigo
        codigo_producto.marca_id = data.marca_id
        self.codigo_repository.update(db, codigo_producto)

        variantes_actuales = db.query(Producto).filter(
            Producto.codigo_producto_id == codigo_producto_id,
            Producto.color_id == color_id
        ).all()
        
        mapa_existentes = {p.talla_id: p for p in variantes_actuales}
        variantes_entrantes_claves = set()
        
        for variante in data.variantes:
            variantes_entrantes_claves.add(variante.talla_id)

            if variante.talla_id in mapa_existentes:
                producto = mapa_existentes[variante.talla_id]
                # Upsert (Actualizacion in-place)
                producto.tipo_calzado_id = data.tipo_calzado_id
                producto.material_id = data.material_id
                producto.descripcion = data.descripcion
                producto.stock_actual = variante.stock_actual
                producto.stock_minimo = variante.stock_minimo
                producto.stock_maximo = variante.stock_maximo
                producto.estado = variante.estado
                
                # Logica de Precio: 
                precio_actual = None
                for p in producto.precios:
                    if p.estado and p.vigente_hasta is None:
                        precio_actual = p
                        break
                        
                if not precio_actual or precio_actual.precio_compra != variante.precio_compra or precio_actual.precio_venta != variante.precio_venta:
                    if precio_actual:
                        precio_actual.vigente_hasta = datetime.now()
                        precio_actual.estado = False
                        
                    nuevo_precio = PrecioProducto(
                        precio_compra=variante.precio_compra,
                        precio_venta=variante.precio_venta,
                        vigente_desde=datetime.now(),
                        estado=True,
                    )
                    producto.precios.append(nuevo_precio)
            else:
                # Insert (Nuevo)
                producto = Producto(
                    codigo_producto_id=codigo_producto_id,
                    tipo_calzado_id=data.tipo_calzado_id,
                    material_id=data.material_id,
                    color_id=color_id,
                    talla_id=variante.talla_id,
                    descripcion=data.descripcion,
                    stock_actual=variante.stock_actual,
                    stock_minimo=variante.stock_minimo,
                    stock_maximo=variante.stock_maximo,
                    estado=variante.estado,
                )
                
                nuevo_precio = PrecioProducto(
                    precio_compra=variante.precio_compra,
                    precio_venta=variante.precio_venta,
                    vigente_desde=datetime.now(),
                    estado=True,
                )
                producto.precios.append(nuevo_precio)
                db.add(producto)
                
        # Desactivar variantes que no vinieron en el payload
        for talla_id, producto in mapa_existentes.items():
            if talla_id not in variantes_entrantes_claves:
                producto.estado = False

        # Procesar actualizaciones de metadata de las imagenes
        if getattr(data, 'imagenes', None):
            for img_data in data.imagenes:
                if img_data.id:
                    imagen = db.query(ProductoImagen).filter(ProductoImagen.id == img_data.id).first()
                    if imagen:
                        imagen.es_principal = img_data.es_principal
                        imagen.orden = img_data.orden

        db.commit()
        return {'msg': 'Producto actualizado correctamente'}
