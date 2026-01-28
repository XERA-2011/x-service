import akshare as ak
try:
    print("Testing stock_us_famous_spot_em without symbol to see available concept codes...")
    # This might fail if symbol is required, but let's see default or doc
    # According to online docs, valid symbols might be "科技类", "金融类", "中概股"?
    # AKShare docs say symbol="..."
    
    # Try getting all US stocks and filter? No that's too heavy.
    # Try different keywords
    keywords = ["中概股", "China", "Chinese", "中国概念股"]
    for k in keywords:
        try:
           print(f"Trying {k}...")
           df = ak.stock_us_famous_spot_em(symbol=k)
           print(f"Success with {k}")
           print(df.head())
           break
        except Exception as e:
           print(f"Failed with {k}: {e}")

except Exception as e:
    print(f"Error: {e}")
