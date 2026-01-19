#!/usr/bin/env python
# -*- coding:utf-8 -*-
"""
Date: 2026/01/15
Desc: 市场概览分析工具
提供市场整体情况的快速分析
"""

import akshare as ak
import pandas as pd
from datetime import datetime
from typing import Dict, Any


#!/usr/bin/env python
# -*- coding:utf-8 -*-
"""
Date: 2026/01/15
Desc: 市场概览分析工具
提供市场整体情况的快速分析
"""

import akshare as ak
import pandas as pd
from datetime import datetime
from typing import Dict, Any, List


class MarketAnalysis:
    """市场概览分析类"""

    @staticmethod
    def get_market_summary() -> Dict[str, Any]:
        """
        获取市场概览 (指数 + 成交量)
        """
        summary = {
            "update_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "indices": [],
            "volume": {"total": 0, "desc": "未知"},
        }
        
        # 1. 获取主要指数
        try:
            indices_map = {
                "sh000001": "上证指数",
                "sz399001": "深证成指",
                "sz399006": "创业板指",
            }
            
            total_volume = 0
            
            for code, name in indices_map.items():
                df = ak.stock_zh_index_daily(symbol=code)
                if df.empty:
                    continue
                    
                latest = df.iloc[-1]
                prev = df.iloc[-2]
                
                change_pct = (latest["close"] / prev["close"] - 1) * 100
                volume = latest["volume"] # 手/股
                amount = latest.get("amount", 0) # 如果有成交额
                
                # 如果 amount 是 nan 或者 0，尝试用 volume 估算（不准确，尽量找有 amount 的接口）
                # 注意：akshare 不同接口返回单位可能不同，这里假设 index_daily 返回的是标准单位
                
                summary["indices"].append({
                    "name": name,
                    "code": code,
                    "price": round(latest["close"], 2),
                    "change": round(change_pct, 2),
                    "amount": amount
                })

            # 由于指数数据可能延迟，获取两市成交额建议用 spot 接口聚合
            # 这里简化处理：直接获取实时成交额（如果有专用接口）
            # 或者通过板块接口汇总是更准确的
            
        except Exception as e:
            print(f"获取指数失败: {e}")

        return summary

    @staticmethod
    def get_market_overview_v2() -> Dict[str, Any]:
        """
        获取市场综合概览 (API 专用)
        包含：主要指数、上涨下跌家数、两市成交额
        """
        result = {
            "indices": [],
            "stats": {},
            "volume_str": "--"
        }
        
        try:
            # 1. 指数行情
            # 使用 stock_zh_index_spot_em 获取实时行情
            spot_df = ak.stock_zh_index_spot_em(symbol="沪深重要指数")
            # 筛选三大指数
            targets = ["上证指数", "深证成指", "创业板指"]
            target_df = spot_df[spot_df["名称"].isin(targets)]
            
            for _, row in target_df.iterrows():
                result["indices"].append({
                    "name": row["名称"],
                    "price": row["最新价"],
                    "change": row["涨跌幅"],
                    "amount": row["成交额"]
                })
                
            # 2. 市场广度 (涨跌家数)
            up_down = ak.stock_zh_a_spot_em()
            up = len(up_down[up_down["涨跌幅"] > 0])
            down = len(up_down[up_down["涨跌幅"] < 0])
            flat = len(up_down[up_down["涨跌幅"] == 0])
            
            result["stats"] = {
                "up": up,
                "down": down,
                "flat": flat
            }
            
            # 3. 两市成交额
            total_amount = target_df["成交额"].sum() # 粗略计算，实际上应该用专门的接口
            # 或者直接累加所有 A 股成交额
            total_amount_all = up_down["成交额"].sum()
            result["volume_str"] = f"{total_amount_all / 100000000:.0f}亿"
            
        except Exception as e:
            print(f"获取市场概览失败: {e}")
            result["error"] = str(e)
            
        return result

    @staticmethod
    def get_sector_top(n: int = 5) -> List[Dict]:
        """获取领涨行业"""
        try:
            df = ak.stock_board_industry_name_em()
            if "涨跌幅" in df.columns:
                df = df.sort_values("涨跌幅", ascending=False).head(n)
                
            return df[["板块名称", "涨跌幅", "领涨股票", "领涨股票-涨跌幅"]].to_dict("records")
        except Exception:
            return []

    @staticmethod
    def get_sector_bottom(n: int = 5) -> List[Dict]:
        """获取领跌行业"""
        try:
            df = ak.stock_board_industry_name_em()
            if "涨跌幅" in df.columns:
                df = df.sort_values("涨跌幅", ascending=True).head(n)
                
            # 注意：跌幅榜通常也显示领涨股票，或者显示最大跌幅股票？
            # 东方财富接口返回的是 "领涨股票"，即使板块下跌，这里显示的也是该板块内涨幅最大的（或跌幅最小的）。
            # 暂时保持原样，显示该板块目前的领头羊。
            return df[["板块名称", "涨跌幅", "领涨股票", "领涨股票-涨跌幅"]].to_dict("records")
        except Exception:
            return []

if __name__ == "__main__":
    print(MarketAnalysis.get_market_overview_v2())

