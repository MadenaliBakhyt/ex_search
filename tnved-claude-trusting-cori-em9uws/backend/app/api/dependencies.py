from collections.abc import AsyncGenerator

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_session
from app.repositories.tnved import TnvedRepository
from app.services.tnved import TnvedService


async def get_repository(
    session: AsyncSession = Depends(get_session),
) -> AsyncGenerator[TnvedRepository, None]:
    yield TnvedRepository(session)


async def get_service(
    repository: TnvedRepository = Depends(get_repository),
) -> AsyncGenerator[TnvedService, None]:
    yield TnvedService(repository)
