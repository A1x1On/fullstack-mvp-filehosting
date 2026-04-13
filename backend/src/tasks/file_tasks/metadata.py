from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession

from src.database import AsyncSessionLocal

from src.tasks.celery_app import celery_app, run_in_worker_loop
from src.tasks.alert_tasks.send import send_file_alert

from src.models.file import File
from src.constants import STORAGE_DIR


async def _extract_file_metadata(file_id: str, session: AsyncSession) -> None:
    file_item = await session.get(File, file_id)
    if not file_item:
        return

    stored_path = STORAGE_DIR / file_item.storedName
    if not stored_path.exists():
        file_item.processingStatus = "failed"
        file_item.scanStatus = file_item.scanStatus or "failed"
        file_item.scanDetails = "stored file not found during metadata extraction"
        await session.commit()

        send_file_alert.delay(file_id)
        return

    metadata = {
        "extension": Path(file_item.originalName).suffix.lower(),
        "size_bytes": file_item.size,
        "mime_type": file_item.mimeType,
    }

    if file_item.mimeType.startswith("text/"):
        content = stored_path.read_text(encoding="utf-8", errors="ignore")
        metadata["line_count"] = len(content.splitlines())
        metadata["char_count"] = len(content)
    elif file_item.mimeType == "application/pdf":
        content = stored_path.read_bytes()
        metadata["approx_page_count"] = max(content.count(b"/Type /Page"), 1)

    file_item.metadataJson = metadata
    file_item.processingStatus = "processed"
    await session.commit()

    send_file_alert.delay(file_id)


@celery_app.task
def extract_file_metadata(file_id: str) -> None:
    async def _run():
        async with AsyncSessionLocal() as session:
            await _extract_file_metadata(file_id, session)

    run_in_worker_loop(_run())
