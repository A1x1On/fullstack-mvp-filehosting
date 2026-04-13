from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.sql import func
from src.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    fileId = Column("file_id", String(36), ForeignKey("files.id"), nullable=False)
    level = Column(String(50), nullable=False)
    message = Column(String(500), nullable=False)
    createdAt = Column(
        "created_at",
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
