from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware

from config import get_settings


settings = get_settings()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Index
@app.get("/")
def root():
    return "API works!"
