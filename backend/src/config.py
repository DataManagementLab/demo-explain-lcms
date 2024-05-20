from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

from ml.config import MLSettings


class Settings(BaseSettings):
    cors_origins: list[str] = []

    ml: MLSettings = MLSettings()

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", env_nested_delimiter="__")


@lru_cache()
def get_settings():
    return Settings()
