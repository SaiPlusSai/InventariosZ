with open('Back/app/modules/producto/models.py', 'r', encoding='utf-8') as f:
    content = f.read()

new_rel = '''    imagenes: Mapped[list["ProductoImagen"]] = relationship(
        "ProductoImagen",
        back_populates="producto",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    movimientos: Mapped[list["MovimientoInventario"]] = relationship(
        "MovimientoInventario",
        back_populates="producto",
        cascade="all, delete-orphan"
    )
'''
content = content.replace(
    '    imagenes: Mapped[list["ProductoImagen"]] = relationship(\n        "ProductoImagen",\n        back_populates="producto",\n        cascade="all, delete-orphan",\n        lazy="selectin",\n    )',
    new_rel
)

content = content.replace(
    'from app.modules.producto_imagen.models import ProductoImagen',
    'from app.modules.producto_imagen.models import ProductoImagen\nfrom app.modules.movimiento_inventario.models import MovimientoInventario'
)

with open('Back/app/modules/producto/models.py', 'w', encoding='utf-8') as f:
    f.write(content)