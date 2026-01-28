import akshare as ak
try:
    print("Testing index_us_stock_sina with symbol='所有'...")
    df = ak.index_us_stock_sina(symbol="所有")
    print(df.head())
    print("\nLooking for China/Golden Dragon:")
    matches = df[df['名称'].str.contains('金龙|中国|China', case=False)]
    print(matches)
except Exception as e:
    print(e)
