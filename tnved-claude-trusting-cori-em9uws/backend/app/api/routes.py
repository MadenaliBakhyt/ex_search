from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.dependencies import get_service
from app.schemas import SearchResult, TnvedResponse
from app.services.tnved import TnvedService

router = APIRouter(prefix="/api")


@router.get("/code/{code}", response_model=TnvedResponse)
async def get_by_code(
    code: str,
    service: TnvedService = Depends(get_service),
):
    result = await service.get_by_code(code)
    if result is None:
        raise HTTPException(status_code=404, detail="Код не найден")
    return result


@router.get("/search", response_model=list[SearchResult])
async def search(
    q: str = Query(..., min_length=1),
    limit: int = Query(default=50, ge=1, le=200),
    service: TnvedService = Depends(get_service),
):
    return await service.search_by_name(q, limit)
