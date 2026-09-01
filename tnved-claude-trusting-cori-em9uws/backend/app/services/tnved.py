from app.models.tnved import Tnved
from app.repositories.tnved import TnvedRepository


class TnvedService:
    def __init__(self, repository: TnvedRepository) -> None:
        self.repository = repository

    async def get_by_code(self, code: str) -> Tnved | None:
        return await self.repository.get_by_code(code)

    async def search_by_name(self, query: str, limit: int = 50) -> list[Tnved]:
        return await self.repository.search_by_name(query, limit)
