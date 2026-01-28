#!/usr/bin/env python
# -*- coding:utf-8 -*-
"""
Date: 2026/01/20
Desc: 美债收益率分析
"""

import akshare as ak
import pandas as pd
from typing import List, Dict, Any
from ...core.cache import cached
from ...core.config import settings
from ...core.utils import akshare_call_with_retry
from ...core.logger import logger


class USTreasury:
    """美债收益率分析"""

    @staticmethod
    @cached(
        "market_us:bond_yields",
        ttl=settings.CACHE_TTL.get("market_overview", 3600),
        stale_ttl=settings.CACHE_TTL.get("market_overview", 3600) * settings.STALE_TTL_RATIO,
    )
    def get_us_bond_yields() -> Dict[str, Any]:
        """
        获取美债收益率
        关注: 2年期, 10年期, 30年期, 10Y-2Y倒挂
        """
        try:
            df = akshare_call_with_retry(ak.bond_zh_us_rate, start_date="20240101")

            if df.empty:
                return []

            latest = df.iloc[-1]

            # 提取数据
            us_2y = (
                float(latest["美国国债收益率2年"])
                if "美国国债收益率2年" in latest
                and pd.notna(latest["美国国债收益率2年"])
                else 0
            )
            us_10y = (
                float(latest["美国国债收益率10年"])
                if "美国国债收益率10年" in latest
                and pd.notna(latest["美国国债收益率10年"])
                else 0
            )
            us_30y = (
                float(latest["美国国债收益率30年"])
                if "美国国债收益率30年" in latest
                and pd.notna(latest["美国国债收益率30年"])
                else 0
            )

            # 计算利差 (倒挂)
            inversion = us_10y - us_2y

            # 获取前一日数据计算变动
            prev_10y = 0.0
            if len(df) > 1:
                prev = df.iloc[-2]
                prev_10y = (
                    float(prev["美国国债收益率10年"])
                    if "美国国债收益率10年" in prev and pd.notna(prev["美国国债收益率10年"])
                    else 0.0
                )
            
            change_10y = us_10y - prev_10y if prev_10y > 0 else 0.0

            # 智能分析生成
            analysis = {
                "text": "市场利率平稳",
                "level": "neutral",  # neutral, warning, danger
                "highlight": False
            }

            # 规则引擎
            if inversion < 0:
                analysis = {
                    "text": "⚠️ 收益率曲线倒挂：衰退信号亮红灯",
                    "level": "danger",
                    "highlight": True
                }
            elif us_10y > 4.5:
                analysis = {
                    "text": "📉 无风险利率高企：由全球流动性收紧导致",
                    "level": "warning",
                    "highlight": True
                }
            elif change_10y > 0.10: # 单日飙升10个基点
                analysis = {
                    "text": "🚀 收益率飙升：市场正剧烈重估通胀风险",
                    "level": "warning",
                    "highlight": True
                }
            elif us_30y > 4.8:
                analysis = {
                    "text": "🦅 30年期高企：长期通胀与债务担忧升温",
                    "level": "warning",
                    "highlight": True
                }

            metrics = [
                {"name": "2年期美债", "value": us_2y, "suffix": "%"},
                {"name": "10年期美债", "value": us_10y, "suffix": "%", "change": round(change_10y, 2)},
                {"name": "30年期美债", "value": us_30y, "suffix": "%"},
                {
                    "name": "10Y-2Y利差",
                    "value": round(inversion, 3),
                    "suffix": "%",
                    "is_spread": True,
                },
            ]

            return {
                "metrics": metrics,
                "analysis": analysis,
                "timestamp": latest.get("日期", str(pd.Timestamp.now().date()))
            }

        except Exception as e:
            logger.error(f"获取美债收益率失败: {e}")
            return []
