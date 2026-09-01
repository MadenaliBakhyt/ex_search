from pydantic import BaseModel


class TnvedResponse(BaseModel):
    code: str
    name: str
    tariff: str | None = None
    details: str | None = None
    documents: list[str] = []

    model_config = {"from_attributes": True}


class SearchResult(BaseModel):
    code: str
    name: str

    model_config = {"from_attributes": True}
