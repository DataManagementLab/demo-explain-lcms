from typing import Any
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


# Use CustomModel as a base class for all schemas instead of pydantic.BaseModel
class CustomModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,  # Transforms snake_case (python style) to camelCase (js style) in json responses
        populate_by_name=True,
        from_attributes=True,
    )

    @classmethod
    def create(cls, obj: Any | None):
        if obj is None:
            return None
        return cls.model_validate(obj)

    def json(self):
        return self.model_dump(by_alias=True)
