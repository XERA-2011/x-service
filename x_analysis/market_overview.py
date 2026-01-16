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


def get_market_summary() -> Dict[str, Any]:
    """
    获取市场概览
    
    Returns:
        dict: 市场概览信息
    """
    summary = {
        "时间": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }
    
    # 获取主要指数
    try:
        indices = {
            "sh000001": "上证指数",
            "sz399001": "深证成指",
            "sz399006": "创业板指",
        }
        
        index_data = {}
        for code, name in indices.items():
            df = ak.stock_zh_index_daily(symbol=code)
            latest = df.iloc[-1]
            prev = df.iloc[-2]
            
            change = (latest["close"] / prev["close"] - 1) * 100
            index_data[name] = {
                "点位": round(latest["close"], 2),
                "涨跌幅": f"{change:+.2f}%"
            }
        
        summary["主要指数"] = index_data
    except Exception as e:
        summary["指数获取失败"] = str(e)
    
    return summary


def get_market_breadth() -> pd.DataFrame:
    """
    获取市场广度 (涨跌家数统计)
    
    Returns:
        pd.DataFrame: 涨跌统计
    """
    try:
        df = ak.stock_zh_a_spot_em()
        
        # 统计涨跌
        up = len(df[df["涨跌幅"] > 0])
        down = len(df[df["涨跌幅"] < 0])
        flat = len(df[df["涨跌幅"] == 0])
        limit_up = len(df[df["涨跌幅"] >= 9.9])  # 涨停
        limit_down = len(df[df["涨跌幅"] <= -9.9])  # 跌停
        
        result = pd.DataFrame([{
            "上涨家数": up,
            "下跌家数": down,
            "平盘家数": flat,
            "涨停家数": limit_up,
            "跌停家数": limit_down,
            "涨跌比": f"{up}:{down}",
            "上涨占比": f"{up/(up+down)*100:.1f}%"
        }])
        
        return result
    except Exception as e:
        print(f"获取市场广度失败: {e}")
        return pd.DataFrame()


def get_sector_performance() -> pd.DataFrame:
    """
    获取行业板块涨跌排行
    
    Returns:
        pd.DataFrame: 行业涨跌排行
    """
    try:
        df = ak.stock_board_industry_name_em()
        
        # 按涨跌幅排序
        if "涨跌幅" in df.columns:
            df = df.sort_values("涨跌幅", ascending=False)
        
        return df
    except Exception as e:
        print(f"获取行业板块失败: {e}")
        return pd.DataFrame()


def get_top_gainers(top_n: int = 10) -> pd.DataFrame:
    """
    获取涨幅榜
    
    Args:
        top_n: 返回数量
        
    Returns:
        pd.DataFrame: 涨幅榜
    """
    try:
        df = ak.stock_zh_a_spot_em()
        df = df.sort_values("涨跌幅", ascending=False)
        
        cols = ["代码", "名称", "最新价", "涨跌幅", "涨跌额", "成交额"]
        return df[cols].head(top_n)
    except Exception as e:
        print(f"获取涨幅榜失败: {e}")
        return pd.DataFrame()


def get_top_losers(top_n: int = 10) -> pd.DataFrame:
    """
    获取跌幅榜
    
    Args:
        top_n: 返回数量
        
    Returns:
        pd.DataFrame: 跌幅榜
    """
    try:
        df = ak.stock_zh_a_spot_em()
        df = df.sort_values("涨跌幅", ascending=True)
        
        cols = ["代码", "名称", "最新价", "涨跌幅", "涨跌额", "成交额"]
        return df[cols].head(top_n)
    except Exception as e:
        print(f"获取跌幅榜失败: {e}")
        return pd.DataFrame()


def get_top_volume(top_n: int = 10) -> pd.DataFrame:
    """
    获取成交额排行
    
    Args:
        top_n: 返回数量
        
    Returns:
        pd.DataFrame: 成交额排行
    """
    try:
        df = ak.stock_zh_a_spot_em()
        df = df.sort_values("成交额", ascending=False)
        
        df["成交额(亿)"] = df["成交额"] / 1e8
        
        cols = ["代码", "名称", "最新价", "涨跌幅", "成交额(亿)"]
        return df[cols].head(top_n)
    except Exception as e:
        print(f"获取成交额排行失败: {e}")
        return pd.DataFrame()


def market_report():
    """
    生成完整的市场报告
    """
    print("=" * 70)
    print("📊 A股市场日报")
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    
    # 市场概览
    print("\n📈 【主要指数】")
    print("-" * 50)
    summary = get_market_summary()
    if "主要指数" in summary:
        for name, data in summary["主要指数"].items():
            print(f"  {name}: {data['点位']} ({data['涨跌幅']})")
    
    # 市场广度
    print("\n📊 【市场广度】")
    print("-" * 50)
    breadth = get_market_breadth()
    if len(breadth) > 0:
        for col in breadth.columns:
            print(f"  {col}: {breadth[col].iloc[0]}")
    
    # 涨幅榜
    print("\n🔥 【涨幅榜 Top 5】")
    print("-" * 50)
    gainers = get_top_gainers(5)
    if len(gainers) > 0:
        print(gainers.to_string(index=False))
    
    # 跌幅榜
    print("\n💔 【跌幅榜 Top 5】")
    print("-" * 50)
    losers = get_top_losers(5)
    if len(losers) > 0:
        print(losers.to_string(index=False))
    
    # 成交额排行
    print("\n💰 【成交额排行 Top 5】")
    print("-" * 50)
    volume = get_top_volume(5)
    if len(volume) > 0:
        print(volume.to_string(index=False))
    
    print("\n" + "=" * 70)
    print("📍 数据来源: AKShare | 仅供参考，不构成投资建议")
    print("=" * 70)


if __name__ == "__main__":
    market_report()
