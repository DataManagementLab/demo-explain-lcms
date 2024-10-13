import pytest
import os.path

from config import Settings
from ml.dependencies import MLHelperOld


@pytest.fixture(scope="session")
def settings(request: pytest.FixtureRequest):
    root_path = os.path.join(str(request.config.rootpath), "tests")
    settings = Settings()
    settings.ml.base_data_dir = os.path.join(root_path, "data")
    settings.ml.dataset_file = "job-light_c8220.json"
    settings.ml.statistics_file = "test_statistics.json"
    settings.ml.zs_model_dir = os.path.join(root_path, "data/test_model")
    settings.ml.zs_model_file_name = "test_model"
    settings.ml.hyperparameters_file = "src/zero_shot_learned_db/experiments/tuned_hyperparameters/tune_best_config.json"
    settings.ml.seed = 42
    return settings


@pytest.fixture(scope="session")
def ml(settings):
    ml = MLHelperOld()
    ml.load(settings, settings.ml.dataset_file)
    return ml
