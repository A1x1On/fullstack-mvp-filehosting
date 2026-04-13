import logging
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from starlette import status

from src.database import get_async_db

from src.schemas.base import ListResponseSchema
from src.schemas.file import (
    FileSchema,
    FileListCriteriaSchema,
    FileUpdateSchema,
)
from src.services.file_service import (
    STORAGE_DIR,
    create_file,
    delete_file,
    get_file,
    list_files,
    list_files_by,
    count_files,
    update_file,
)
from src.tasks.file_tasks.threats import scan_file_for_threats

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/files", tags=["files"])

DB = Annotated[AsyncSession, Depends(get_async_db)]


@router.get("/", response_model=ListResponseSchema[FileSchema])
async def list_files_view(session: DB) -> ListResponseSchema[FileSchema]:
    files = await list_files(session)
    return ListResponseSchema[FileSchema](data=files, count=len(files))


@router.post("/getByCriteria", response_model=ListResponseSchema[FileSchema])
async def list_files_by_view(
    payload: FileListCriteriaSchema, session: DB
) -> ListResponseSchema[FileSchema]:
    files = await list_files_by(payload, session)
    count = await count_files(session)
    return ListResponseSchema[FileSchema](data=files, count=count)


@router.post("/", response_model=FileSchema, status_code=status.HTTP_201_CREATED)
async def create_file_view(
    session: DB,
    title: str = Form(...),
    file: UploadFile = File(...),
) -> FileSchema:
    file_item = await create_file(title, upload_file=file, session=session)

    print("file_itemfile_itemfile_itemfile_item", file_item.id)
    try:
        scan_file_for_threats.delay(file_item.id)
    except Exception:
        logger.warning(
            "Could not enqueue scan task for file %s — is Redis running?", file_item.id
        )
    return file_item


@router.get("/{file_id}", response_model=FileSchema)
async def get_file_view(file_id: str, session: DB) -> FileSchema:
    return await get_file(file_id, session)


@router.patch("/{file_id}", response_model=FileSchema)
async def update_file_view(
    file_id: str, payload: FileUpdateSchema, session: DB
) -> FileSchema:
    return await update_file(file_id, payload.title, session)


@router.get("/{file_id}/download")
async def download_file(file_id: str, session: DB) -> FileResponse:
    file_item = await get_file(file_id, session)
    stored_path = STORAGE_DIR / file_item.storedName
    if not stored_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stored file not found",
        )
    return FileResponse(
        path=stored_path,
        media_type=file_item.mimeType,
        filename=file_item.originalName,
    )


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file_view(file_id: str, session: DB) -> None:
    await delete_file(file_id, session)
