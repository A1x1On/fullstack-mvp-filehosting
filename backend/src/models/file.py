from sqlalchemy import Boolean, Column, DateTime, Integer, JSON, String
from sqlalchemy.sql import func

from src.database import Base


class File(Base):
    __tablename__ = "files"

    id = Column(String(36), primary_key=True)
    title = Column(String(255), nullable=False)
    originalName = Column("original_name", String(255), nullable=False)
    storedName = Column("stored_name", String(255), nullable=False, unique=True)
    mimeType = Column("mime_type", String(255), nullable=False)
    size = Column(Integer, nullable=False)
    processingStatus = Column(
        "processing_status", String(50), nullable=False, default="uploaded"
    )
    scanStatus = Column("scan_status", String(50), nullable=True)
    scanDetails = Column("scan_details", String(500), nullable=True)
    metadataJson = Column("metadata_json", JSON, nullable=True)
    requiresAttention = Column(
        "requires_attention", Boolean, nullable=False, default=False
    )
    createdAt = Column(
        "created_at", DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updatedAt = Column(
        "updated_at",
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
