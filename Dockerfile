# 使用轻量级 Python 基础镜像
FROM python:3.9-slim

# 设置工作目录
WORKDIR /app

# 设置时区
ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# 1. 复制依赖文件并安装
# 使用阿里云镜像加速下载
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/

# 2. 复制项目代码
COPY . .

# 3. 设置 PYTHONPATH 使得 Python 能找到当前目录下的包 (x_analysis)
ENV PYTHONPATH=/app

# 4. 暴露端口 (aktools 默认通常使用 8080)
EXPOSE 8080

# 5. 启动服务
CMD ["python", "server.py"]
