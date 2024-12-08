from pydantic import BaseModel


class QuerySettings(BaseModel):
    db_name: str = "zs_queries"
    db_init_backup_file: str = "zs_queries.backup"
    saved_runs_config_file: str = "saved_runs_config.json"
    datasets_runs_dir: str = "runs/parsed_plans"
    datasets_runs_raw_dir: str = "runs/raw"
    pass
