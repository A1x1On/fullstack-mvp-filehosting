from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import src.tasks  # noqa: F401 — registers all Celery tasks on startup
from src.routers import files, alerts


app = FastAPI(title="FastAPI Starter", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
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
