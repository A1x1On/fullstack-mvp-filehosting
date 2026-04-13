from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_async_db

from src.schemas.base import ListResponseSchema
from src.schemas.alert import AlertSchema, AlertListCriteriaSchema

from src.services.alert_service import (
    list_alerts,
    list_alerts_by,
    count_alerts,
)

router = APIRouter(prefix="/api/alerts", tags=["alerts"])

DB = Annotated[AsyncSession, Depends(get_async_db)]


@router.get("/", response_model=ListResponseSchema[AlertSchema])
async def list_alerts_view(session: DB) -> ListResponseSchema[AlertSchema]:
    alerts = await list_alerts(session)
    return ListResponseSchema[AlertSchema](data=alerts, count=len(alerts))


@router.post("/getByCriteria", response_model=ListResponseSchema[AlertSchema])
async def list_alerts_by_view(
    payload: AlertListCriteriaSchema, session: DB
) -> ListResponseSchema[AlertSchema]:
    alerts = await list_alerts_by(payload, session)
    count = await count_alerts(session)
    return ListResponseSchema[AlertSchema](data=alerts, count=count)
