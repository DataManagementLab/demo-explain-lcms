import os.path
from typing import TypeVar
from pydantic import BaseModel

from zero_shot_learned_db.explanations.utils import load_json_str


def save_model_to_file(model: BaseModel, file_name: str, format: bool = False):
    with open(file_name, mode="w") as file:
        file.write(model.model_dump_json(indent=2 if format else None))


T = TypeVar("T", bound=BaseModel)


def load_model_from_file(model: type[T], file_name: str):
    if os.path.isfile(file_name):
        return model.model_validate_json(load_json_str(file_name))
