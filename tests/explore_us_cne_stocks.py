import akshare as ak
try:
    print("Testing stock_us_famous_spot_em for Chinese Concept Stocks...")
    df = ak.stock_us_famous_spot_em(symbol="中概股")
    print("Columns:", df.columns.tolist())
    print(df.head())
except Exception as e:
    print(f"Error: {e}")
