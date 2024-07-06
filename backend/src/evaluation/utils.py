import os.path
from pydantic import BaseModel

from zero_shot_learned_db.explainers.load import load_json_str


def save_model_to_file(model: BaseModel, file_name: str):
    with open(file_name, mode="w") as file:
        file.write(model.model_dump_json())


def load_model_from_file(model: type[BaseModel], file_name: str):
    if os.path.isfile(file_name):
        return model.model_validate_json(load_json_str(file_name))
