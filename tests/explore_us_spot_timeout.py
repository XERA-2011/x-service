import akshare as ak
import pandas as pd
print("Start")
# Try a smaller fetch or just print if empty
try:
    # This call is slow, might need retry or async in production
    # But for debug, let's wait
    df = ak.stock_us_spot_em()
    print(f"Fetched {len(df)} rows")
    
    # Check simple names
    print(df.head())
    
    targets = ['BABA', 'PDD', 'JD', 'BIDU']
    # Check if '代码' matches
    for t in targets:
        m = df[df['代码'].astype(str).str.contains(t)]
        if not m.empty:
            print(f"Found {t}:")
            print(m[['代码', '名称', '最新价']])
            
except Exception as e:
    print(e)
