"""
宏观数据API路由
"""

from fastapi import APIRouter
from typing import Dict, Any, Optional
from ..modules.macro import (
    LPRAnalysis,
    NorthFundsAnalysis,
    ETFFlowAnalysis,
    EconomicCalendar,
)

router = APIRouter(prefix="/macro", tags=["宏观数据"])


@router.get("/lpr", summary="获取 LPR 利率")
def get_lpr_rates() -> Dict[str, Any]:
    """获取贷款市场报价利率 (LPR)"""
    return LPRAnalysis.get_lpr_rates()


@router.get("/north-funds", summary="获取北向资金")
def get_north_funds() -> Dict[str, Any]:
    """获取北向资金（沪股通 + 深股通）净流入"""
    return NorthFundsAnalysis.get_north_funds_flow()


@router.get("/etf-flow", summary="获取 ETF 资金流向")
def get_etf_flow(limit: int = 10) -> Dict[str, Any]:
    """获取 ETF 资金流向 TOP N"""
    return ETFFlowAnalysis.get_etf_fund_flow(limit=limit)


@router.get("/calendar", summary="获取经济日历")
def get_economic_calendar(date: Optional[str] = None) -> Dict[str, Any]:
    """
    获取经济日历事件
    
    Args:
        date: 日期，格式 YYYYMMDD，默认今天
    """
    return EconomicCalendar.get_today_events(date=date)
