"""
ETF 资金流向分析
"""

import akshare as ak
from typing import Dict, Any, List
from ...core.cache import cached
from ...core.config import settings
from ...core.utils import safe_float, get_beijing_time, akshare_call_with_retry
from ...core.logger import logger


class ETFFlowAnalysis:
    """ETF 资金流向分析"""

    @staticmethod
    @cached(
        "macro:etf_flow",
        ttl=settings.CACHE_TTL.get("etf_flow", 7200),
        stale_ttl=settings.CACHE_TTL.get("etf_flow", 7200) * settings.STALE_TTL_RATIO,
    )
    def get_etf_fund_flow(limit: int = 10) -> Dict[str, Any]:
        """
        获取 ETF 资金流向 TOP10

        Args:
            limit: 返回数量

        Returns:
            ETF 资金流向数据
        """
        try:
            logger.info("获取 ETF 资金流向...")
            df = akshare_call_with_retry(ak.fund_etf_fund_daily_em, max_retries=3)

            if df.empty:
                raise ValueError("无法获取 ETF 数据")

            # 提取增长率数值并排序
            df["增长率_num"] = df["增长率"].str.replace("%", "").astype(float)
            
            # 获取涨幅前 N 和跌幅前 N
            top_gainers = df.nlargest(limit, "增长率_num")
            top_losers = df.nsmallest(limit, "增长率_num")

            def format_etf(row: Any) -> Dict[str, Any]:
                return {
                    "code": str(row.get("基金代码", "")),
                    "name": str(row.get("基金简称", "")),
                    "type": str(row.get("类型", "")),
                    "change_pct": safe_float(row.get("增长率_num", 0)),
                    "price": safe_float(row.get("市价", 0)),
                    "discount_rate": str(row.get("折价率", "")),
                }

            gainers: List[Dict[str, Any]] = [
                format_etf(row) for _, row in top_gainers.iterrows()
            ]
            losers: List[Dict[str, Any]] = [
                format_etf(row) for _, row in top_losers.iterrows()
            ]

            return {
                "gainers": gainers,
                "losers": losers,
                "total_count": len(df),
                "update_time": get_beijing_time().strftime("%Y-%m-%d %H:%M:%S"),
                "description": "ETF 资金流向反映市场主力资金的配置方向",
            }

        except Exception as e:
            logger.error(f"获取 ETF 资金流向失败: {e}")
            return {
                "error": str(e),
                "gainers": [],
                "losers": [],
                "total_count": 0,
                "update_time": get_beijing_time().strftime("%Y-%m-%d %H:%M:%S"),
            }
