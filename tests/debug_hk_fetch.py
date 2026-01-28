import akshare as ak
import pandas as pd
print("Start Fetching HK...")
try:
    df = ak.stock_hk_index_spot_sina()
    print("Columns:", df.columns.tolist())
    print("Head:\n", df.head())
    
    codes = ["HSI", "HSTECH", "HSCEI", "HSCCI"]
    print("\nChecking Core Indices:")
    for c in codes:
        row = df[df['代码'] == c]
        if not row.empty:
            print(f"{c}: Found")
            print(row[['代码', '名称', '最新价', '涨跌幅']])
        else:
            print(f"{c}: Not Found")
            
except Exception as e:
    print(f"Error: {e}")
