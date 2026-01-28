import akshare as ak
try:
    # Try fetching default indices
    df = ak.index_us_stock_sina(symbol="道琼斯工业平均指数")
    # This function usually takes symbol names in Chinese or specific codes?
    # Docs say: symbol="道琼斯工业平均指数" | "纳斯达克综合指数" | "标普500指数"
    
    # Try getting list?
    pass 
except Exception as e:
    print(e)

# Since we can't reliably get 'index_us_stock_sina' list, let's use hardcoded major CNE stock as a proxy for '中概股' index?
# Or just use BABA, PDD, JD, NIO as the "Indices"
