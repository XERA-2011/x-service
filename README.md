# X-Analytics

个人 A 股数据分析平台，基于 [AKShare](https://github.com/akfamily/akshare) 构建。

## 📡 API 接口

完整接口文档：`/analytics/docs` (Swagger UI)

## 🛠️ 本地开发

```bash
# 安装依赖
pip install -r requirements.txt

# 启动服务
python server.py

# 访问
open http://localhost:8080/          # Web 仪表盘
open http://localhost:8080/docs      # API 文档
```

## 🐳 Docker 部署

```bash
# 构建镜像
docker build -t x-analytics .

# 运行
docker run -d -p 8080:8080 x-analytics
```

## 📁 项目结构

```
x-analytics/
├── server.py           # FastAPI 入口
├── requirements.txt    # Python 依赖
├── Dockerfile          # 容器构建 (多阶段)
├── analytics/          # 核心分析模块
└── web/                # Web 仪表盘
```
