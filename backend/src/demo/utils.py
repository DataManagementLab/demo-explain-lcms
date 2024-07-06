from typing import Any
from pydantic.alias_generators import to_camel


def dict_keys_to_camel(dictionary: dict[str, Any]):
    for key in list(dictionary):
        dictionary[to_camel(key)] = dictionary.pop(key)


def list_values_to_camel(values: list[str]):
    values = values.copy()
    for i in range(0, len(values)):
        values[i] = to_camel(values[i])
    return values
