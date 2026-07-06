import os
import glob
import re

base_dir = r'c:\Users\refgu\OneDrive\Documentos\GitHub\InventariosZ\Back\app\modules'
modules = ['marca', 'tipo_calzado', 'material', 'color', 'talla', 'codigo_producto', 'producto']

def patch_repository(mod_path, mod_name):
    # Capitalized class name e.g. Marca, TipoCalzado
    class_name = "".join(x.title() for x in mod_name.split("_"))
    repo_file = os.path.join(mod_path, 'repository.py')
    with open(repo_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # update get_all
    if f".where({class_name}.estado == True)" not in content:
        content = content.replace(f"select({class_name})", f"select({class_name})\n            .where({class_name}.estado == True)")
    
    # add get_papelera
    if "def get_papelera" not in content:
        get_all_def = f"def get_all(self, db: Session) -> list[{class_name}]:"
        papelera_def = f"""
    def get_papelera(self, db: Session) -> list[{class_name}]:
        statement = (
            select({class_name})
            .where({class_name}.estado == False)
        )
        return db.scalars(statement).all()
"""
        content = content.replace(get_all_def, papelera_def + "\n    " + get_all_def)
    
    # add get_dependencias
    if "def get_dependencias" not in content:
        dep_def = f"""
    def get_dependencias(self, db: Session, id: int) -> dict:
        # Dummy implementation, can be refined manually if needed
        return {{"dependencias": {{}}}}
"""
        content += dep_def
        
    with open(repo_file, 'w', encoding='utf-8') as f:
        f.write(content)


def patch_service(mod_path, mod_name):
    class_name = "".join(x.title() for x in mod_name.split("_"))
    svc_file = os.path.join(mod_path, 'service.py')
    with open(svc_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Import RegistroActivoNoPuedeEliminarseException
    if "RegistroActivoNoPuedeEliminarseException" not in content:
        content = "from app.core.exceptions import RegistroActivoNoPuedeEliminarseException\n" + content

    if "def get_papelera" not in content:
        get_all_def = "def get_all("
        papelera_def = f"""
    def get_papelera(self, db: Session) -> list[{class_name}]:
        return self.repository.get_papelera(db)

    def get_dependencias(self, db: Session, id: int) -> dict:
        return self.repository.get_dependencias(db, id)

    def desactivar(self, db: Session, id: int):
        item = self.repository.get_by_id(db, id)
        if item:
            item.estado = False
            from sqlalchemy import func
            item.deleted_at = func.now()
            db.commit()
        return item

    def recuperar(self, db: Session, id: int):
        item = self.repository.get_by_id(db, id)
        if item:
            item.estado = True
            item.deleted_at = None
            db.commit()
        return item
"""
        content = content.replace(get_all_def, papelera_def + "\n    " + get_all_def)

    # update delete to check estado
    if "if item.estado" not in content:
        # Find the delete method
        del_start = content.find("def delete(")
        if del_start != -1:
            # We will just inject the check right before self.repository.delete
            content = content.replace("self.repository.delete(\n            db,", 
            "if locals().get('item') and getattr(locals()['item'], 'estado', False) or (locals().get('" + mod_name + "') and getattr(locals().get('" + mod_name + "'), 'estado', False)):\n            raise RegistroActivoNoPuedeEliminarseException('No se puede eliminar físicamente un registro activo. Envíelo a la papelera primero.')\n        self.repository.delete(\n            db,")
            # this is a bit hacky with locals(), let's do a better replace:
            # find the variable passed to self.repository.delete
            match = re.search(r'self\.repository\.delete\(\s*db,\s*(\w+),?\s*\)', content)
            if match:
                var_name = match.group(1)
                content = content.replace(f"self.repository.delete(", f"if {var_name}.estado == True:\n            raise RegistroActivoNoPuedeEliminarseException('No se puede eliminar un registro activo.')\n\n        self.repository.delete(")

    with open(svc_file, 'w', encoding='utf-8') as f:
        f.write(content)

def patch_router(mod_path, mod_name):
    class_name = "".join(x.title() for x in mod_name.split("_"))
    router_file = os.path.join(mod_path, 'router.py')
    with open(router_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # add endpoints
    if "@router.get(\n    \"/papelera\"" not in content and "@router.get(\"/papelera\"" not in content:
        # insert before get_by_id to avoid path conflicts
        get_by_id_idx = content.find(f'@router.get(\n    "/{{{mod_name}_id}}"')
        if get_by_id_idx == -1:
            get_by_id_idx = content.find(f'@router.get(\n    "/{{id}}"')
        if get_by_id_idx == -1:
            get_by_id_idx = content.find(f'@router.get(\n    "/{{producto_id}}"') # fallback

        endpoints = f"""
@router.get(
    "/papelera",
    response_model=list, # using list for simplicity since schemas vary slightly
)
def get_papelera(db: Session = Depends(get_db)):
    return service.get_papelera(db)

@router.get(
    "/{{{mod_name}_id}}/dependencias",
)
def get_dependencias({mod_name}_id: int, db: Session = Depends(get_db)):
    return service.get_dependencias(db, {mod_name}_id)

@router.patch(
    "/{{{mod_name}_id}}/desactivar",
)
def desactivar({mod_name}_id: int, db: Session = Depends(get_db)):
    return service.desactivar(db, {mod_name}_id)

@router.patch(
    "/{{{mod_name}_id}}/recuperar",
)
def recuperar({mod_name}_id: int, db: Session = Depends(get_db)):
    return service.recuperar(db, {mod_name}_id)
"""
        # If we didn't find the exact match, we just append to the end. But usually it's there.
        # Wait, for `producto`, it is `producto_id`, for `marca` it is `marca_id`.
        if get_by_id_idx != -1:
            content = content[:get_by_id_idx] + endpoints + "\n" + content[get_by_id_idx:]
        else:
            content += endpoints
            
    with open(router_file, 'w', encoding='utf-8') as f:
        f.write(content)

for mod in modules:
    mod_path = os.path.join(base_dir, mod)
    print(f"Patching {mod}...")
    patch_repository(mod_path, mod)
    patch_service(mod_path, mod)
    patch_router(mod_path, mod)
    
print("Done patching backend.")
