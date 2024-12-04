from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

from evaluation.config import EvaluationSettings
from ml.config import MLSettings
from query.config import QuerySettings


class Settings(BaseSettings):
    cors_origins: list[str] = []
    db_host: str = "localhost"
    db_port: str = "5432"
    db_user: str = "postgres"
    db_password: str = ""
    db_log: bool = False

    disable_eval_routes: bool = False

    ml: MLSettings = MLSettings()
    eval: EvaluationSettings = EvaluationSettings()
    query: QuerySettings = QuerySettings()

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", env_nested_delimiter="__")


@lru_cache()
def get_settings():
    return Settings()
