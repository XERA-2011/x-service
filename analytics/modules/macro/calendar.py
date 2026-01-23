"""
经济日历
"""

import akshare as ak
from typing import Dict, Any, List, Optional
from ...core.cache import cached
from ...core.config import settings
from ...core.utils import get_beijing_time, akshare_call_with_retry
from ...core.logger import logger


class EconomicCalendar:
    """经济日历"""

    @staticmethod
    @cached(
        "macro:calendar",
        ttl=settings.CACHE_TTL.get("calendar", 3600),
        stale_ttl=settings.CACHE_TTL.get("calendar", 3600) * settings.STALE_TTL_RATIO,
    )
    def get_today_events(date: Optional[str] = None) -> Dict[str, Any]:
        """
        获取今日经济事件

        Args:
            date: 日期，格式 YYYYMMDD，默认今天

        Returns:
            经济日历数据
        """
        try:
            if date is None:
                date = get_beijing_time().strftime("%Y%m%d")

            logger.info(f"获取经济日历: {date}")
            df = akshare_call_with_retry(
                ak.news_economic_baidu, date=date, max_retries=3
            )

            if df.empty:
                return {
                    "date": date,
                    "events": [],
                    "count": 0,
                    "update_time": get_beijing_time().strftime("%Y-%m-%d %H:%M:%S"),
                    "message": "今日无重要经济事件",
                }

            # 按重要性和时间排序
            df = df.sort_values(["重要性", "时间"], ascending=[False, True])

            events: List[Dict[str, Any]] = []
            for _, row in df.iterrows():
                importance = int(row.get("重要性", 1))
                # 只返回重要性 >= 2 的事件，或者全部事件（如果太少）
                if importance >= 2 or len(df) <= 10:
                    events.append({
                        "time": str(row.get("时间", "")),
                        "region": str(row.get("地区", "")),
                        "event": str(row.get("事件", "")),
                        "actual": _format_value(row.get("公布")),
                        "forecast": _format_value(row.get("预期")),
                        "previous": _format_value(row.get("前值")),
                        "importance": importance,
                    })

            # 按地区分组统计
            region_counts: Dict[str, int] = {}
            for event in events:
                region = event["region"]
                region_counts[region] = region_counts.get(region, 0) + 1

            return {
                "date": f"{date[:4]}-{date[4:6]}-{date[6:8]}",
                "events": events[:20],  # 最多返回 20 条
                "count": len(events),
                "total_count": len(df),
                "regions": region_counts,
                "update_time": get_beijing_time().strftime("%Y-%m-%d %H:%M:%S"),
                "description": "重要经济数据发布日历，影响市场走势",
            }

        except Exception as e:
            logger.error(f"获取经济日历失败: {e}")
            return {
                "error": str(e),
                "date": date,
                "events": [],
                "count": 0,
                "update_time": get_beijing_time().strftime("%Y-%m-%d %H:%M:%S"),
            }


def _format_value(val: Any) -> Optional[str]:
    """格式化数值，处理 NaN"""
    if val is None:
        return None
    try:
        f = float(val)
        if f != f:  # NaN check
            return None
        return str(val)
    except (ValueError, TypeError):
        return str(val) if val else None
