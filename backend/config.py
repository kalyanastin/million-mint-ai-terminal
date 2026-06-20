"""
Configuration module for Million Mint AI Terminal.

Uses pydantic-settings to load environment variables from .env file
with sensible defaults for local development.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    REDIS_URL: str = "redis://localhost:6379"
    GEMINI_API_KEY: str = ""
    ALLOWED_ORIGINS: str = "http://localhost:3000"
    API_PORT: int = 8000


settings = Settings()
