# X-Service

个人数据分析 API 服务，基于 [AKShare](https://github.com/akfamily/akshare) 构建。

## 🚀 功能特性

- **市场情绪分析**：恐慌贪婪指数、中国波指 (QVIX)、北向资金流向
- **技术指标计算**：RSI、MACD、KDJ、Bias 乖离率等
- **数据可视化**：个股分析、指数对比、基金排行

## 📡 API 接口

部署后可通过以下接口访问：

| 接口 | 说明 |
|------|------|
| `GET /api/x/health` | 健康检查 |
| `GET /api/x/sentiment/fear-greed` | 恐慌贪婪指数 |
| `GET /api/x/sentiment/qvix` | 中国波指 (QVIX) |
| `GET /api/x/sentiment/north-flow` | 北向资金情绪 |

完整接口文档：`/aktools/docs` (Swagger UI)

## 🛠️ 本地开发

```bash
# 安装依赖
pip install -r requirements.txt

# 启动服务
python server.py

# 访问
open http://localhost:8080/docs
```

## 🐳 Docker 部署

```bash
# 构建镜像
docker build -t x-service .

# 运行
docker run -d -p 8080:8080 x-service
```

## 📁 项目结构

```
x-service/
├── server.py           # FastAPI 入口
├── requirements.txt    # Python 依赖
├── Dockerfile          # 容器构建 (多阶段)
└── analysis/           # 分析模块
    ├── sentiment_analysis.py   # 情绪分析
    ├── stock_analysis.py       # 个股分析
    ├── index_analysis.py       # 指数分析
    ├── fund_analysis.py        # 基金分析
    ├── market_overview.py      # 市场概览
    └── technical_analysis.py   # 技术指标
```

## 🔗 相关项目

- [x-actions](https://github.com/XERA-2011/x-actions) - 部署配置
- [AKShare](https://github.com/akfamily/akshare) - 金融数据源
