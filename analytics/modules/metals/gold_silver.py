"""
金银比分析
计算金银比及相关投资分析
使用 COMEX 期货数据 (美元计价)
"""

import akshare as ak
from typing import Dict, Any, List
from ...core.cache import cached
from ...core.config import settings
from ...core.utils import safe_float, get_beijing_time, akshare_call_with_retry


class GoldSilverAnalysis:
    """金银比分析 (COMEX 美元计价)"""

    # COMEX 合约代码
    GOLD_CODE = "GC00Y"   # COMEX黄金主力
    SILVER_CODE = "SI00Y"  # COMEX白银主力

    # 历史统计 (数据来源: 50年历史数据)
    HISTORICAL_HIGH = 123.8   # 2020年3月 COVID危机
    HISTORICAL_LOW = 14.0     # 1980年1月 (白银投机泡沫)
    HISTORICAL_AVG = 65.0     # 50年历史均值

    @staticmethod
    @cached("metals:gold_silver_ratio", ttl=settings.CACHE_TTL["metals"], stale_ttl=600)
    def get_gold_silver_ratio() -> Dict[str, Any]:
        """
        获取金银比数据和分析 (COMEX 美元计价)
        """
        try:
            # 使用带重试的 API 调用
            df = akshare_call_with_retry(ak.futures_global_spot_em)

            if df.empty:
                return {"error": "无法获取期货数据", "ratio": {"current": 0}}

            # 获取黄金数据
            gold_row = df[df["代码"] == GoldSilverAnalysis.GOLD_CODE]
            silver_row = df[df["代码"] == GoldSilverAnalysis.SILVER_CODE]

            # 备用合约代码
            if gold_row.empty:
                gold_row = df[df["代码"].str.contains("GC2", na=False)].head(1)
            if silver_row.empty:
                silver_row = df[df["代码"].str.contains("SI2", na=False)].head(1)

            if gold_row.empty or silver_row.empty:
                return {"error": "无法获取黄金或白银数据", "ratio": {"current": 0}}

            gold = gold_row.iloc[0]
            silver = silver_row.iloc[0]

            gold_price = safe_float(gold["最新价"])
            silver_price = safe_float(silver["最新价"])
            gold_change = safe_float(gold["涨跌幅"])
            silver_change = safe_float(silver["涨跌幅"])

            if gold_price <= 0 or silver_price <= 0:
                return {"error": "价格数据无效", "ratio": {"current": 0}}

            # 计算金银比 (无量纲)
            ratio = gold_price / silver_price

            # 分析
            ratio_analysis = GoldSilverAnalysis._analyze_ratio_level(ratio, [])
            investment_advice = GoldSilverAnalysis._get_investment_advice(
                ratio, ratio_analysis
            )

            return {
                "gold": {
                    "price": round(gold_price, 2),
                    "change_pct": round(gold_change, 2),
                    "unit": "USD/oz",
                    "name": "COMEX黄金",
                },
                "silver": {
                    "price": round(silver_price, 2),
                    "change_pct": round(silver_change, 2),
                    "unit": "USD/oz",
                    "name": "COMEX白银",
                },
                "ratio": {
                    "current": round(ratio, 2),
                    "historical_high": GoldSilverAnalysis.HISTORICAL_HIGH,
                    "historical_low": GoldSilverAnalysis.HISTORICAL_LOW,
                    "historical_avg": GoldSilverAnalysis.HISTORICAL_AVG,
                    "analysis": ratio_analysis,
                    "investment_advice": investment_advice,
                },
                "update_time": get_beijing_time().strftime("%Y-%m-%d %H:%M:%S"),
                "explanation": GoldSilverAnalysis._get_explanation(),
            }

        except Exception as e:
            print(f"❌ 获取金银比失败: {e}")
            return {"error": str(e), "ratio": {"current": 0}}

    @staticmethod
    def _analyze_ratio_level(
        current_ratio: float, history: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """分析金银比水平"""
        # 简化版分析

        if current_ratio > 90:
            level = "极高"
            comment = "白银相对被低估"
        elif current_ratio > 85:
            level = "偏高"
            comment = "白银相对便宜"
        elif current_ratio < 65:
            level = "极低"
            comment = "黄金相对被低估"
        elif current_ratio < 75:
            level = "偏低"
            comment = "黄金相对便宜"
        else:
            level = "正常"
            comment = "处于合理区间"

        return {"level": level, "comment": comment}

    @staticmethod
    def _get_investment_advice(
        ratio: float, analysis: Dict[str, Any]
    ) -> Dict[str, Any]:
        """获取投资建议"""
        level = analysis.get("level", "正常")
        if level in ["极高", "偏高"]:
            return {
                "preferred_metal": "白银",
                "strategy": "关注白银",
                "reasoning": "金银比高企，白银胜率较高",
            }
        elif level in ["极低", "偏低"]:
            return {
                "preferred_metal": "黄金",
                "strategy": "关注黄金",
                "reasoning": "金银比低位，黄金性价比较高",
            }
        else:
            return {
                "preferred_metal": "均衡",
                "strategy": "均衡配置",
                "reasoning": "金银比正常",
            }

    @staticmethod
    def _get_explanation() -> str:
        return """
金银比(Gold-Silver Ratio)说明：
• 定义：黄金价格与白银价格的比值
• 核心逻辑：比值过高暗示白银低估，比值过低暗示黄金低估
• 数据来源：COMEX期货价格 (美元/盎司)
        """.strip()
