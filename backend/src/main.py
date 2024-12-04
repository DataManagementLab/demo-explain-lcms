import sys

sys.path.append("./zero_shot_learned_db")

import logging
from logger import log_request_middleware
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from ml.dependencies import MLHelper

from evaluation.router import router as evaluation_router
from test_approaches.router import router as test_approaches_router
from query.db import get_db, setup_db_connection as setup_query_db_connection
from query.store import store_all_workload_queries_in_db
from query.router import router as query_router
from evaluation_fns.router import router as evaluation_fns_router
from validate_queries_in_db import validate_queries_in_db


settings = get_settings()

if settings.db_log:
    sqlalchemy_logger = logging.getLogger("sqlalchemy.engine")
    sqlalchemy_logger.setLevel(logging.INFO)
    file_handler = logging.FileHandler("sqlalchemy.log", mode="w")
    file_handler.setLevel(logging.INFO)
    formatter = logging.Formatter("%(asctime)s - %(message)s")
    file_handler.setFormatter(formatter)
    sqlalchemy_logger.handlers.clear()
    sqlalchemy_logger.addHandler(file_handler)


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_query_db_connection(settings)
    store_all_workload_queries_in_db(settings)

    ml_helper = MLHelper()
    with next(get_db()) as db:
        ml_helper.load(settings, db)
    app.dependency_overrides[MLHelper] = lambda: ml_helper

    if settings.ml.validate_queries_in_db:
        with next(get_db()) as db:
            validate_queries_in_db(ml_helper, db, settings)

    yield


app = FastAPI(lifespan=lifespan)


app.middleware("http")(log_request_middleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(evaluation_router)
app.include_router(test_approaches_router)
app.include_router(query_router)
if not settings.disable_eval_routes:
    app.include_router(evaluation_fns_router)


# Index
@app.get("/")
def root():
    return "API works!"
