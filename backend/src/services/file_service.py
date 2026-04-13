import mimetypes
from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.file import File
from src.constants import STORAGE_DIR
from src.schemas.file import FileListCriteriaSchema


async def list_files(session: AsyncSession) -> list[File]:
    result = await session.scalars(
        select(File).order_by(File.createdAt.desc()).limit(100)
    )
    return result.all()


async def list_files_by(
    payload: FileListCriteriaSchema, session: AsyncSession
) -> list[File]:

    print(payload.limit, payload.offset)
    query = (
        select(File)
        .order_by(File.createdAt.desc())
        .offset(payload.offset)
        .limit(payload.limit)
    )
    result = await session.scalars(query)
    return result.all()


async def count_files(session: AsyncSession) -> int:
    query = select(func.count(File.id))
    return await session.scalar(query) or 0


async def get_file(file_id: str, session: AsyncSession) -> File:
    file_item = await session.get(File, file_id)
    if file_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="File not found"
        )
    return file_item


async def create_file(
    title: str,
    upload_file: UploadFile,
    session: AsyncSession,
) -> File:
    content = await upload_file.read()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="File is empty"
        )

    file_id = str(uuid4())
    suffix = Path(upload_file.filename or "").suffix
    stored_name = f"{file_id}{suffix}"
    (STORAGE_DIR / stored_name).write_bytes(content)

    file_item = File(
        id=file_id,
        title=title,
        originalName=upload_file.filename or stored_name,
        storedName=stored_name,
        mimeType=(
            upload_file.content_type
            or mimetypes.guess_type(stored_name)[0]
            or "application/octet-stream"
        ),
        size=len(content),
        processingStatus="uploaded",
    )
    session.add(file_item)
    await session.commit()
    await session.refresh(file_item)
    return file_item


async def update_file(
    file_id: str,
    title: str,
    session: AsyncSession,
) -> File:
    file_item = await get_file(file_id, session)
    file_item.title = title
    await session.commit()
    await session.refresh(file_item)
    return file_item


async def delete_file(file_id: str, session: AsyncSession) -> None:
    file_item = await get_file(file_id, session)
    stored_path = STORAGE_DIR / file_item.storedName
    if stored_path.exists():
        stored_path.unlink()
    await session.delete(file_item)
    await session.commit()
