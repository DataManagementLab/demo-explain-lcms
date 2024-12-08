from typing import Annotated
from fastapi import Depends
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker, DeclarativeBase
from config import Settings
from db_utils import create_db, get_db_connection_string

SessionLocal = None
engine = None


def setup_db_connection(settings: Settings):
    create_db(settings, settings.query.db_name, settings.query.db_init_backup_file)
    connection_string = get_db_connection_string(settings, settings.query.db_name)
    global engine
    engine = create_engine(connection_string)
    global SessionLocal
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_depends = Annotated[Session, Depends(get_db)]
