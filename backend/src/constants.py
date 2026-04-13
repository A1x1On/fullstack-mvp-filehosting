from pathlib import Path

# Storage
BASE_DIR = Path(__file__).resolve().parent.parent
STORAGE_DIR = BASE_DIR / "storage" / "files"
STORAGE_DIR.mkdir(parents=True, exist_ok=True)

# File scan
SUSPICIOUS_EXTENSIONS: frozenset[str] = frozenset(
    {".exe", ".bat", ".cmd", ".sh", ".js"}
)
MAX_FILE_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB
PDF_ALLOWED_MIME_TYPES: frozenset[str] = frozenset(
    {"application/pdf", "application/octet-stream"}
)
