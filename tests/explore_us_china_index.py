import akshare as ak
try:
    # 尝试获取纳斯达克金龙中国指数
    # 新浪接口通常包含主要指数
    df = ak.stock_us_index_spot_sina()
    # Looking for Golden Dragon
    # Symbol might be 'HXC' or similar, name contains '金龙' or 'China'
    
    print("Sina Indices:")
    print(df[['代码', '名称', '最新价', '涨跌幅']])
except Exception as e:
    print(e)
