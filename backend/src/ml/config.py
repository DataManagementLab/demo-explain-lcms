from pydantic import BaseModel


class MLSettings(BaseModel):
    base_data_dir: str = ""
    dataset_file: str = ""
    validation_base_dir: str = ""
    validate_queries_in_db: bool = False
    limit_plans: int | None = None
    statistics_file: str = ""
    zs_model_dir: str = ""
    zs_model_file_name: str = ""
    load_only_first_model_from_runs_config: bool = True

    hyperparameters_file: str = ""

    device: str = "cpu"
    batch_size: int = 1
    seed: int = 0

    explainers_log: bool = False
    validate_graphs_from_nodes: bool = False

    plans_cache_max_size: int = 10
