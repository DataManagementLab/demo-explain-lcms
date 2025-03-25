from typing import Annotated
from fastapi import APIRouter, Depends, Form, UploadFile
from config import Settings, get_settings
from ml.dependencies import MLHelper
from query.db import db_depends
from query.models import ZeroShotModelConfig
import shutil
from zero_shot_models.schemas import ZeroShotModelResponse, ZeroShotModelsResponse
import os.path
from pathlib import Path

router = APIRouter(tags=["query"], prefix="/zero-shot-models")


@router.get("", response_model=ZeroShotModelsResponse)
def get_all_zero_shot_models(db: db_depends, ml: Annotated[MLHelper, Depends()]):
    return ZeroShotModelsResponse(
        zero_shot_models=db.query(ZeroShotModelConfig).all(),
        default_model_id=ml.default_model_id,
    )

"""
@router.post("", response_model=ZeroShotModelResponse)
def add_zero_shot_model(
    name: Annotated[str, Form()],
    file: UploadFile,
    db: db_depends,
    ml: Annotated[MLHelper, Depends()],
    settings: Annotated[Settings, Depends(get_settings)],
):
    base_model_dir = os.path.join(settings.ml.base_data_dir, settings.ml.zs_model_dir)
    file_name = file.filename
    if file_name is not None:
        file_name = Path(file_name).stem + ".pt"
    else:
        file_name = "model.pt"
    file_path = os.path.join(base_model_dir, file_name)
    i = 1
    while os.path.isfile(file_path):
        file_name = Path(file_name).stem + "_" + str(i) + ".pt"
        file_path = os.path.join(base_model_dir, file_name)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    zs_model_db = ZeroShotModelConfig(name=name, file_name=Path(file_name).stem)
    db.add(zs_model_db)
    db.commit()
    db.refresh(zs_model_db)
    ml.load_model(zs_model_db, db)
    return zs_model_db
"""

"""
@router.delete("")
def delete_zero_shot_model(model_id: int, db: db_depends):
    db.query(ZeroShotModelConfig).filter(ZeroShotModelConfig.id == model_id).delete()
    db.commit()
"""
