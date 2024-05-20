import sys

sys.path.append("./zero_shot_learned_db")

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from ml.dependencies import MLHelpers
from demo.router import router as demo_router


settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    ml_helpers = MLHelpers()
    ml_helpers.load(settings)
    app.dependency_overrides[MLHelpers] = lambda: ml_helpers
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


# Index
@app.get("/")
def root():
    return "API works!"
