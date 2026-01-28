import akshare as ak
try:
    print("Listing all known symbols for stock_us_famous_spot_em is hard, trying stock_us_spot_em to see if we can filter by sector/concept?")
    # stock_us_spot_em gets all US stocks?
    # No, it likely returns a list of popular ones or requires pagination
    
    # Try getting index data for "Nasdaq Golden Dragon China" (HXC)
    print("Testing Nasdaq Golden Dragon China Index...")
    # Symbol often: HXC, PGJ (ETF)
    
    # Let's try fetching a specific "China Concept" ETF or Index
    # MGC (Kweb equivalent)
    
    # Maybe use stock_us_spot_em() and search for specific tickers like BABA, PDD, JD, NIO
    df = ak.stock_us_spot_em()
    print("Columns:", df.columns.tolist())
    
    targets = ['BABA', 'PDD', 'JD', 'NIO', 'BIDU']
    mask = df['代码'].apply(lambda x: any(t in str(x) for t in targets))
    filtered = df[mask]
    print("Found CNE stocks:")
    print(filtered[['代码', '名称', '最新价', '涨跌幅']])
    
except Exception as e:
    print(f"Error: {e}")
