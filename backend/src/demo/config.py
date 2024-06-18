from pydantic import BaseModel


class DemoSettings(BaseModel):
    evaluation_results_dir: str = "evaluation_results"
