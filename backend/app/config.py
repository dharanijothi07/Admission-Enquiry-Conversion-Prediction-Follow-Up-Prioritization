"""Application settings, read from environment variables (or a local .env file)."""
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env", extra="ignore", protected_namespaces=("settings_",)
    )

    # Example value only. Put your real connection string in backend/.env or in Render.
    database_url: str = "postgresql://admissions:change_me@localhost:5432/admissions_db"
    # Comma-separated list of frontend URLs allowed to call this API (CORS).
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    # Turns the "Load demo data" endpoint on or off.
    enable_demo_endpoints: bool = True
    # Where the trained ML model files are stored.
    model_dir: str = str(BACKEND_DIR / "ml_artifacts")

    @property
    def sqlalchemy_url(self) -> str:
        """Render/Heroku give 'postgres://' or 'postgresql://'. SQLAlchemy needs a driver name."""
        url = self.database_url.strip()
        if url.startswith("postgres://"):
            url = "postgresql://" + url[len("postgres://"):]
        if url.startswith("postgresql://"):
            url = "postgresql+psycopg2://" + url[len("postgresql://"):]
        return url

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip().rstrip("/") for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
