from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    POSTGRES_HOST: str = "backend-db"  # "localhost"
    POSTGRES_PORT: int = 5433
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "test"
    POSTGRES_SSL: str = "false"
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"

    model_config = {"env_file": ".env", "extra": "ignore", "env_file_encoding": "utf-8"}

    @property
    def _ssl(self) -> bool:
        return self.POSTGRES_SSL.lower() == "true"

    @property
    def sync_database_url(self) -> str:
        suffix = "?sslmode=require" if self._ssl else ""
        return (
            f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}{suffix}"
        )

    @property
    def async_database_url(self) -> str:
        suffix = "?ssl=require" if self._ssl else ""
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}{suffix}"
        )

    @property
    def REDIS_URL(self) -> str:
        return self.CELERY_BROKER_URL


settings = Settings()
