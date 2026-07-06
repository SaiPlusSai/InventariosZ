from fastapi import APIRouter, File, UploadFile

from app.modules.storage.service import storage_service

router = APIRouter(
    prefix="/storage",
    tags=["Storage"],
)


@router.get("/ping")
def ping():
    return {
        "status": "ok"
    }


@router.post("/upload-test")
async def upload_test(
    archivo: UploadFile = File(...)
):
    return await storage_service.subir_archivo(
        producto_id=999,
        archivo=archivo,
    )