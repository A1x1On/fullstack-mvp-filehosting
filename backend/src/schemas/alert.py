from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class AlertSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    fileId: str
    level: str
    message: str
    createdAt: datetime


class AlertListCriteriaSchema(BaseModel):
    limit: int = Field(default=20, ge=1, le=100)
    offset: int = Field(default=0, ge=0)
