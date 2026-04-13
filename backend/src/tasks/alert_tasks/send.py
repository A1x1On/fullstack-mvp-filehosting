from sqlalchemy.ext.asyncio import AsyncSession

from src.database import AsyncSessionLocal
from src.models.alert import Alert
from src.models.file import File
from src.tasks.celery_app import celery_app, run_in_worker_loop


async def _send_file_alert(file_id: str, session: AsyncSession) -> None:
    file_item = await session.get(File, file_id)
    if not file_item:
        return

    if file_item.processingStatus == "failed":
        alert = Alert(
            fileId=file_id, level="critical", message="File processing failed"
        )
    elif file_item.requiresAttention:
        alert = Alert(
            fileId=file_id,
            level="warning",
            message=f"File requires attention: {file_item.scanDetails}",
        )
    else:
        alert = Alert(
            fileId=file_id, level="info", message="File processed successfully"
        )

    session.add(alert)
    await session.commit()


@celery_app.task
def send_file_alert(file_id: str) -> None:
    async def _run():
        async with AsyncSessionLocal() as session:
            await _send_file_alert(file_id, session)

    run_in_worker_loop(_run())
