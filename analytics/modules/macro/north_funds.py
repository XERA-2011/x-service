"""
北向资金流向分析
"""

import akshare as ak
from typing import Dict, Any, List
from ...core.cache import cached
from ...core.config import settings
from ...core.utils import safe_float, get_beijing_time, akshare_call_with_retry
from ...core.logger import logger


class NorthFundsAnalysis:
    """北向资金分析"""

    @staticmethod
    @cached(
        "macro:north_funds",
        ttl=settings.CACHE_TTL.get("north_funds", 7200),
        stale_ttl=settings.CACHE_TTL.get("north_funds", 7200) * settings.STALE_TTL_RATIO,
    )
    def get_north_funds_flow() -> Dict[str, Any]:
        """
        获取北向资金（沪股通 + 深股通）净流入

        Returns:
            北向资金数据
        """
        try:
            logger.info("获取北向资金数据...")
            df = akshare_call_with_retry(
                ak.stock_hsgt_fund_flow_summary_em, max_retries=3
            )

            if df.empty:
                raise ValueError("无法获取北向资金数据")

            # 筛选北向资金 (沪股通 + 深股通)
            north_df = df[df["资金方向"] == "北向"]

            if north_df.empty:
                raise ValueError("北向资金数据为空")

            # 汇总北向资金
            total_net_buy = 0.0
            total_net_flow = 0.0
            details: List[Dict[str, Any]] = []

            for _, row in north_df.iterrows():
                net_buy = safe_float(row.get("成交净买额", 0))
                net_flow = safe_float(row.get("资金净流入", 0))
                total_net_buy += net_buy
                total_net_flow += net_flow

                details.append({
                    "channel": str(row.get("板块", "")),
                    "net_buy": round(net_buy / 1e8, 2),  # 转换为亿
                    "net_flow": round(net_flow / 1e8, 2),
                    "up_count": int(row.get("上涨数", 0)),
                    "down_count": int(row.get("下跌数", 0)),
                    "index": str(row.get("相关指数", "")),
                    "index_change": safe_float(row.get("指数涨跌幅", 0)),
                })

            # 判断市场信号
            signal = "neutral"
            signal_text = "资金平衡"
            if total_net_flow > 50e8:  # 净流入超过 50 亿
                signal = "bullish"
                signal_text = "外资看多"
            elif total_net_flow < -50e8:  # 净流出超过 50 亿
                signal = "bearish"
                signal_text = "外资撤离"

            trade_date = str(north_df.iloc[0].get("交易日", ""))[:10]

            return {
                "date": trade_date,
                "total": {
                    "net_buy": round(total_net_buy / 1e8, 2),  # 亿元
                    "net_flow": round(total_net_flow / 1e8, 2),
                },
                "signal": {
                    "type": signal,
                    "text": signal_text,
                },
                "details": details,
                "update_time": get_beijing_time().strftime("%Y-%m-%d %H:%M:%S"),
                "description": "北向资金 = 沪股通 + 深股通，反映外资对 A 股的态度",
            }

        except Exception as e:
            logger.error(f"获取北向资金失败: {e}")
            return {
                "error": str(e),
                "date": None,
                "total": None,
                "details": [],
                "update_time": get_beijing_time().strftime("%Y-%m-%d %H:%M:%S"),
            }
