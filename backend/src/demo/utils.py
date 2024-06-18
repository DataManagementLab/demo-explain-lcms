from typing import Any
from pydantic import BaseModel
from pydantic.alias_generators import to_camel
import os.path

from zero_shot_learned_db.explainers.load import load_json_str


def dict_keys_to_camel(dictionary: dict[str, Any]):
    for key in list(dictionary):
        dictionary[to_camel(key)] = dictionary.pop(key)


def list_values_to_camel(values: list[str]):
    values = values.copy()
    for i in range(0, len(values)):
        values[i] = to_camel(values[i])
    return values


def save_model_to_file(model: BaseModel, file_name: str):
    with open(file_name, mode="w") as file:
        file.write(model.model_dump_json())


def load_model_from_file(model: type[BaseModel], file_name: str):
    if os.path.isfile(file_name):
        return model.model_validate_json(load_json_str(file_name))
