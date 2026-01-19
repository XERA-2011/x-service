import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from analytics.sentiment import SentimentAnalysis
from analytics.market import MarketAnalysis
import os

# 创建 FastAPI 应用
# root_path 用于支持通过反向代理访问时 Swagger UI 正常工作
app = FastAPI(
    title="X-Analytics API",
    description="A 股数据分析服务，基于 AKShare 构建",
    version="1.0.0",
    root_path="/analytics"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------------------------------------------------------
# API 接口
# -----------------------------------------------------------------------------
@app.get("/api/sentiment/fear-greed", tags=["情绪分析"], summary="获取市场恐慌贪婪指数")
def get_fear_greed_index(symbol: str = "sh000001", days: int = 14):
    """自定义恐慌贪婪指数"""
    return SentimentAnalysis.calculate_fear_greed_custom(symbol=symbol, days=days)

@app.get("/api/market/overview", tags=["市场分析"], summary="获取市场概览(指数/成交/涨跌分布)")
def get_market_overview():
    """获取主要指数行情、市场广度和两市成交额"""
    return MarketAnalysis.get_market_overview_v2()

@app.get("/api/market/sector-top", tags=["市场分析"], summary="获取领涨行业")
def get_sector_top(n: int = 5):
    """获取领涨行业板块 Top N"""
    return MarketAnalysis.get_sector_top(n=n)

@app.get("/api/market/sector-bottom", tags=["市场分析"], summary="获取领跌行业")
def get_sector_bottom(n: int = 5):
    """获取领跌行业板块 Top N"""
    return MarketAnalysis.get_sector_bottom(n=n)

@app.get("/api/health", tags=["系统"], summary="服务健康检查")
def health_check():
    return {"status": "ok", "service": "x-analytics", "version": "1.0.0"}


# -----------------------------------------------------------------------------
# 静态文件 (Web 仪表盘)
# -----------------------------------------------------------------------------
web_dir = os.path.join(os.path.dirname(__file__), "web")
if os.path.exists(web_dir):
    app.mount("/", StaticFiles(directory=web_dir, html=True), name="web")


if __name__ == "__main__":
    # 本地调试启动
    uvicorn.run("server:app", host="0.0.0.0", port=8080, reload=True)
