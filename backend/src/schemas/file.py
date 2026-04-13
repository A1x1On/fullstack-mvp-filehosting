from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class FileSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    title: str
    originalName: str
    storedName: str
    mimeType: str
    size: int
    processingStatus: str
    scanStatus: str | None
    scanDetails: str | None
    metadataJson: dict | None
    requiresAttention: bool
    createdAt: datetime
    updatedAt: datetime


class FileListCriteriaSchema(BaseModel):
    limit: int = Field(default=20, ge=1, le=100)
    offset: int = Field(default=0, ge=0)


class FileUpdateSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    title: str
