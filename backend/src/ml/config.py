from pydantic import BaseModel


class MLSettings(BaseModel):
    base_data_dir: str = ""
    dataset_file: str = ""
    limit_plans: int | None = None
    statistics_file: str = ""
    zs_model_dir: str = ""
    zs_model_file_name: str = ""

    hyperparameters_file: str = ""

    device: str = "cpu"
    batch_size: int = 1
    seed: int = 0

    explainers_log: bool = False
