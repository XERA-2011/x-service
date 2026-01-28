import akshare as ak
try:
    print("Trying to fetch KWEB (ETF) as proxy for CNE Index")
    # stock_us_hist(symbol='105.KWEB') ?
    # stock_us_spot_em is the only real-time one.
    
    # If standard calls fail, we might need to fallback to a simpler data source or accept we can't get real-time CNE index easily.
    # However, user asked for "Major Indices" to include "中概股".
    # Akshare might have 'stock_zh_index_daily' but for US?
    
    # Let's try ? No.
    pass
except Exception as e:
    print(e)
