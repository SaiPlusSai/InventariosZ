import os

modulos = ['marca', 'tipo_calzado', 'material', 'color', 'talla']

schema_additions = """
class FilaPrevia(BaseModel):
    fila: int
    nombre: str | None
    descripcion: str | None
{codigo_hex_field}
    valido: bool
    errores: list[str]

class PreviaImportacionResponse(BaseModel):
    total: int
    validos: int
    errores: int
    filas: list[FilaPrevia]

class ConfirmarImportacionRequest(BaseModel):
    filas: list[FilaPrevia]
"""

for mod in modulos:
    schema_path = f"app/modules/{mod}/schemas.py"
    with open(schema_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    if "PreviaImportacionResponse" not in content:
        extra_field = "    codigo_hex: str | None = None" if mod == 'color' else ""
        content += schema_additions.replace("{codigo_hex_field}", extra_field)
        with open(schema_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated schemas for {mod}")

service_additions = """
    def exportar_excel(self, db: Session) -> BytesIO:
        items = self.repository.get_all(db)
        wb = Workbook()
        ws = wb.active
        ws.title = "{Capitalized}"
        headers = ["ID", "Nombre", "Descripción", "Estado"{extra_header}]
        ws.append(headers)
        for item in items:
            ws.append([
                item.id,
                item.nombre,
                getattr(item, 'descripcion', ''),
                "Activo" if item.estado else "Inactivo"
                {extra_col}
            ])
        buffer = BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        return buffer

    def generar_plantilla_importacion(self) -> BytesIO:
        wb = Workbook()
        ws = wb.active
        ws.title = "Plantilla {Capitalized}"
        headers = ["Nombre", "Descripción"{extra_header2}]
        ws.append(headers)
        ws.append(["Ejemplo {Capitalized}", "Descripción de ejemplo"{extra_col2}])
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
            
            {row_unpack}
            
            fila_errores = []
            nombre_str = str(nombre).strip() if nombre is not None else None
            desc_str = str(descripcion).strip() if descripcion is not None else None
            {hex_str_def}

            if not nombre_str: 
                fila_errores.append("Nombre es obligatorio.")
            else:
                existente = self.repository.get_by_nombre(db, nombre_str)
                if existente:
                    fila_errores.append(f"{Capitalized} '{nombre_str}' ya existe.")
            
            {hex_validation}

            es_valido = len(fila_errores) == 0
            if es_valido:
                validos += 1
            else:
                errores += 1

            filas.append(FilaPrevia(
                fila=idx,
                nombre=nombre_str,
                descripcion=desc_str,
                {hex_kwarg}
                valido=es_valido,
                errores=fila_errores
            ))

        return PreviaImportacionResponse(total=len(filas), validos=validos, errores=errores, filas=filas)

    def confirmar_importacion(self, db: Session, filas: list[FilaPrevia]):
        try:
            creados = 0
            for fila in filas:
                if not fila.valido: continue
                {create_logic}
                creados += 1
            db.commit()
            return {"success": True, "creados": creados}
        except Exception as e:
            db.rollback()
            raise e
"""

for mod in modulos:
    service_path = f"app/modules/{mod}/service.py"
    with open(service_path, "r", encoding="utf-8") as f:
        content = f.read()

    if "exportar_excel" not in content:
        # Add imports
        imports = "from io import BytesIO\nfrom openpyxl import Workbook, load_workbook\nfrom fastapi import UploadFile\nfrom app.modules." + mod + ".schemas import PreviaImportacionResponse, FilaPrevia, " + mod.replace('_', ' ').title().replace(' ', '') + "Create\n"
        content = imports + content
        
        cap = mod.replace('_', ' ').title().replace(' ', '')
        
        extra_header = ', "Código Hex"' if mod == 'color' else ''
        extra_col = ", getattr(item, 'codigo_hex', '')" if mod == 'color' else ''
        
        extra_header2 = ', "Código Hex"' if mod == 'color' else ''
        extra_col2 = ', "#FFFFFF"' if mod == 'color' else ''
        
        row_unpack = "nombre, descripcion, codigo_hex = (list(row)[:3] + [None]*3)[:3]" if mod == 'color' else "nombre, descripcion = (list(row)[:2] + [None]*2)[:2]"
        hex_str_def = "codigo_hex_str = str(codigo_hex).strip() if codigo_hex is not None else None" if mod == 'color' else ""
        hex_validation = 'if not codigo_hex_str: fila_errores.append("Código Hex es obligatorio.")' if mod == 'color' else ""
        hex_kwarg = "codigo_hex=codigo_hex_str," if mod == 'color' else ""
        
        create_logic = f"payload = {cap}Create(nombre=fila.nombre, descripcion=fila.descripcion or '')\n                self.create(db, payload)"
        if mod == 'color':
            create_logic = f"payload = {cap}Create(nombre=fila.nombre, codigo_hex=fila.codigo_hex)\n                self.create(db, payload)"
        
        additions = service_additions.replace("{Capitalized}", cap)\
            .replace("{extra_header}", extra_header)\
            .replace("{extra_col}", extra_col)\
            .replace("{extra_header2}", extra_header2)\
            .replace("{extra_col2}", extra_col2)\
            .replace("{row_unpack}", row_unpack)\
            .replace("{hex_str_def}", hex_str_def)\
            .replace("{hex_validation}", hex_validation)\
            .replace("{hex_kwarg}", hex_kwarg)\
            .replace("{create_logic}", create_logic)
        
        # Insert before get_all or at the end
        if "def get_all(" in content:
            content = content.replace("def get_all(", additions + "\n    def get_all(")
        else:
            content += additions
            
        with open(service_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated service for {mod}")

router_additions = """
@router.get("/exportar/excel")
def exportar_excel(db: Session = Depends(get_db)):
    buffer = service.exportar_excel(db)
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={cap}_inventario.xlsx"}
    )

@router.get("/importar/plantilla")
def importar_plantilla():
    buffer = service.generar_plantilla_importacion()
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=plantilla_{cap}.xlsx"}
    )

@router.post("/importar/previa", response_model=PreviaImportacionResponse)
async def previa_importacion(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El archivo debe ser un Excel")
    return await service.previa_importacion(db, file)

@router.post("/importar/confirmar")
def confirmar_importacion(data: ConfirmarImportacionRequest, db: Session = Depends(get_db)):
    try:
        return service.confirmar_importacion(db, data.filas)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
"""

for mod in modulos:
    router_path = f"app/modules/{mod}/router.py"
    with open(router_path, "r", encoding="utf-8") as f:
        content = f.read()

    if "exportar_excel" not in content:
        cap = mod.replace('_', ' ').title().replace(' ', '')
        # Add imports
        imports = "from fastapi import UploadFile, File\nfrom fastapi.responses import StreamingResponse\nfrom app.modules." + mod + ".schemas import PreviaImportacionResponse, ConfirmarImportacionRequest\n"
        if "from fastapi.responses import StreamingResponse" in content:
            imports = "from fastapi import UploadFile, File\nfrom app.modules." + mod + ".schemas import PreviaImportacionResponse, ConfirmarImportacionRequest\n"
        
        content = imports + content
        
        additions = router_additions.replace("{cap}", cap).replace("{mod}", mod)
        
        content += additions
            
        with open(router_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated router for {mod}")

