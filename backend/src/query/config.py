from pydantic import BaseModel


class QuerySettings(BaseModel):
    db_name: str = "zs_queries"
    pass
