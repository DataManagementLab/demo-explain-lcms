import sys

sys.path.append("./zero_shot_learned_db")

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from ml.dependencies import MLHelper
from evaluation.dependencies import EvaluationPlansLoader
from demo.router import router as demo_router
from evaluation.router import router as evaluation_router
from test_approaches.router import router as test_approaches_router
from query.db import setup_db_connection as setup_query_db_connection
from query.store import store_all_workload_queries_in_db
from query.router import router as query_router


settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    ml_helper = MLHelper()
    ml_helper.load(settings)
    evaluation_plans_loader = EvaluationPlansLoader()
    evaluation_plans_loader.load(settings, ml_helper)
    app.dependency_overrides[MLHelper] = lambda: ml_helper
    app.dependency_overrides[EvaluationPlansLoader] = lambda: evaluation_plans_loader

    setup_query_db_connection(settings)
    store_all_workload_queries_in_db(settings)

    yield


app = FastAPI(lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(demo_router)
app.include_router(evaluation_router)
app.include_router(test_approaches_router)
app.include_router(query_router)


# Index
@app.get("/")
def root():
    return "API works!"
