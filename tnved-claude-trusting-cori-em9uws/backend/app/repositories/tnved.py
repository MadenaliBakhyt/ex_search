from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.tnved import Tnved


class TnvedRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_code(self, code: str) -> Tnved | None:
        return await self.session.get(Tnved, code)

    async def search_by_name(self, query: str, limit: int = 50) -> list[Tnved]:
        stmt = (
            select(Tnved)
            .where(Tnved.name.ilike(f"%{query}%"))
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
