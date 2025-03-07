from pydantic import BaseModel


class SavedDataset(BaseModel):
    name: str
    directory: str
    zsmodels: list[str]
    runs: list[str]
    runs_names: list[str]


class SavedRunsConfig(BaseModel):
    datasets: list[SavedDataset]
