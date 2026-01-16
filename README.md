# AKShare 分析工具箱

## 🚀 常用命令

在项目根目录下，使用 `python -m` 方式运行模块：

| 分析维度 | 命令 | 说明 |
|:---|:---|:---|
| **🎭 市场情绪** | `python3 -m akshare.x_analysis.sentiment_analysis` | 恐慌贪婪指数、VIX波动率、北向资金 |
| **📊 全局概览** | `python3 -m akshare.x_analysis.market_overview` | 指数涨跌、涨跌家数、行业排行 |
| **📈 个股分析** | `python3 -m akshare.x_analysis.stock_analysis` | 历史行情、均线、波动率 (默认平安银行) |
| **📉 指数对比** | `python3 -m akshare.x_analysis.index_analysis` | 主要指数收益率对比 |
| **💰 基金排行** | `python3 -m akshare.x_analysis.fund_analysis` | 基金涨幅榜、净值走势 |
| **📐 技术指标** | `python3 -m akshare.x_analysis.technical_analysis` | MACD, RSI, KDJ 等买卖信号判断 |

---
*Tip: 所有脚本均可单独运行，无需额外参数。*
