import akshare as ak
try:
    # Try fetching specific index directly if known code
    # Nasdaq Golden Dragon China: 'HXC' (often requires prefix or specific lookup)
    # Sina usually uses 'ixic', 'dji', 'spx'
    
    # Try fetching individual stock quotes for major CNE
    print("Fetching BABA quote...")
    df = ak.stock_us_spot_em() # Back to this, but maybe it works sometimes?
    # No, it times out.
    
    # Is there a 'get_quote' for single US stock?
    # stock_us_hist?
    pass
except Exception as e:
    print(e)
