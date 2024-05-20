from pydantic import BaseModel


class MLSettings(BaseModel):
    base_data_dir: str = ""
    dataset_file: str = ""
    limit_plans: int | None = None
    statistics_file: str = ""
    zs_model_dir: str = ""
    zs_model_file_name: str = ""

    hyperparameters_file: str = "zero_shot_learned_db/experiments/tuned_hyperparameters/tune_best_config.json"

    device: str = "cpu"
    batch_size: int = 1
    seed: int = 0
