from pydantic import BaseModel


class SavedDataset(BaseModel):
    name: str
    directory: str
    # zsmodels: list[str]
    runs: list[str]
    runs_names: list[str]


class ZSModelFileConfig(BaseModel):
    name: str
    file_name: str
    dataset: str | None = None


class SavedRunsConfig(BaseModel):
    datasets: list[SavedDataset]
    zs_models: list[ZSModelFileConfig]
