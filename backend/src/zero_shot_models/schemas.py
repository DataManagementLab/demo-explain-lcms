from custom_model import CustomModel


class ZeroShotModelResponse(CustomModel):
    id: int
    name: str
    file_name: str


class ZeroShotModelsResponse(CustomModel):
    zero_shot_models: list[ZeroShotModelResponse]
    default_model_id: int
