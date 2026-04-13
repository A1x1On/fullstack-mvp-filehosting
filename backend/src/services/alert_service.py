from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.alert import Alert
from src.schemas.alert import AlertListCriteriaSchema


async def list_alerts(session: AsyncSession) -> list[Alert]:
    result = await session.scalars(
        select(Alert).order_by(Alert.createdAt.desc()).limit(100)
    )
    return result.all()


async def list_alerts_by(
    payload: AlertListCriteriaSchema, session: AsyncSession
) -> list[Alert]:

    print(payload.limit, payload.offset)
    query = (
        select(Alert)
        .order_by(Alert.createdAt.desc())
        .offset(payload.offset)
        .limit(payload.limit)
    )
    result = await session.scalars(query)
    return result.all()


async def count_alerts(session: AsyncSession) -> int:
    query = select(func.count(Alert.id))
    return await session.scalar(query) or 0


async def create_alert(
    fileId: str,
    level: str,
    message: str,
    session: AsyncSession,
) -> Alert:
    alert = Alert(fileId=fileId, level=level, message=message)
    session.add(alert)
    await session.commit()
    await session.refresh(alert)
    return alert
