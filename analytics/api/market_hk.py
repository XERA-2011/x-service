from fastapi import APIRouter
from ..modules.market_hk import HKIndices
from ..core.cache import wrap_response

router = APIRouter()

@router.get("/indices")
async def get_hk_indices():
    """获取港股指数和板块概览"""
    result = HKIndices.get_market_data()
    if result.get("status") == "error":
         return wrap_response(status="error", message=result.get("error"))
    return wrap_response(status="ok", data=result)
