import os
import os.path
from typing import Annotated
from fastapi import Depends

from config import Settings, get_settings


def get_evaluation_results_dir(config: Annotated[Settings, Depends(get_settings)]):
    if not os.path.exists(config.demo.evaluation_results_dir):
        os.mkdir(config.demo.evaluation_results_dir)
    return config.demo.evaluation_results_dir
