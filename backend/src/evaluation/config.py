from pydantic import BaseModel


class EvaluationSettings(BaseModel):
    results_dir: str = "evaluation_results"
    max_table_count: int = 5
    max_plans_per_table_count: int = 100
    evaluate_fidelity_params: bool = False
    use_binary_fidelity: bool = False
    valid_qerror_threshold: float = 10
    main_model_token: str = "_0"
