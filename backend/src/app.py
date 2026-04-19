from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import src.tasks  # noqa: F401 — registers all Celery tasks on startup
from src.routers import files, alerts
from src.config import settings

print("=== SETTINGS DEBUG ===")
print("POSTGRES_USER     =", settings.POSTGRES_USER)
print("POSTGRES_PASSWORD =", repr(settings.POSTGRES_PASSWORD))
print("POSTGRES_HOST     =", settings.POSTGRES_HOST)
print("POSTGRES_PORT     =", settings.POSTGRES_PORT)
print("POSTGRES_DB       =", settings.POSTGRES_DB)
print("ASYNC DATABASE URL:", settings.async_database_url)
print("settings.sync_database_url:", settings.sync_database_url)
print("settings.REDIS_URL:", settings.REDIS_URL)
print("settings.CELERY_BROKER_URL:", settings.CELERY_BROKER_URL)
print("====================")

app = FastAPI(title="FastAPI Starter", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://178.72.186.112",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root() -> str:
    return "Hello World!"


app.include_router(files.router)
app.include_router(alerts.router)
