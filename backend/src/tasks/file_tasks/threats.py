from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession

from src.database import AsyncSessionLocal

from src.tasks.celery_app import celery_app, run_in_worker_loop
from src.tasks.file_tasks.metadata import extract_file_metadata

from src.models.file import File
from src.constants import (
    MAX_FILE_SIZE_BYTES,
    PDF_ALLOWED_MIME_TYPES,
    SUSPICIOUS_EXTENSIONS,
)


async def _scan_file_for_threats(file_id: str, session: AsyncSession) -> None:
    file_item = await session.get(File, file_id)

    print(
        "file_itemfile_itemfile_itemfile_item",
        file_item.originalName,
        file_item.mimeType,
        file_item.size,
    )
    if not file_item:
        return

    file_item.processingStatus = "processing"
    reasons: list[str] = []
    extension = Path(file_item.originalName).suffix.lower()

    if extension in SUSPICIOUS_EXTENSIONS:
        reasons.append(f"suspicious extension {extension}")

    if file_item.size > MAX_FILE_SIZE_BYTES:
        reasons.append("file is larger than 10 MB")

    if extension == ".pdf" and file_item.mimeType not in PDF_ALLOWED_MIME_TYPES:
        reasons.append("pdf extension does not match mime type")

    file_item.scanStatus = "suspicious" if reasons else "clean"
    file_item.scanDetails = ", ".join(reasons) if reasons else "no threats found"
    file_item.requiresAttention = bool(reasons)
    await session.commit()

    extract_file_metadata.delay(file_id)


@celery_app.task
def scan_file_for_threats(file_id: str) -> None:
    async def _run():
        async with AsyncSessionLocal() as session:
            await _scan_file_for_threats(file_id, session)

    run_in_worker_loop(_run())
