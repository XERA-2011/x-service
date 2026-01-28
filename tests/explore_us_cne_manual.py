import akshare as ak
import pandas as pd

try:
    print("Fetching US Spot EM...")
    df = ak.stock_us_spot_em()
    # Define top CNE stocks manually if we can't find a "Concept" list
    # BABA, PDD, JD, BIDU, NIO, LI, XPEV, BEKE, TME, YUMC
    cne_codes = ['105.BABA', '105.PDD', '105.JD', '105.BIDU', '105.NIO', '105.LI', '105.XPEV'] 
    # Note: EM uses prefixes usually. Let's see raw codes.
    
    # Filter by name contains
    targets = ['阿里巴巴', '拼多多', '京东', '百度', '蔚来', '理想', '小鹏']
    
    matched = df[df['名称'].str.contains('|'.join(targets), na=False)]
    print("Matched Stocks:")
    print(matched[['代码', '名称', '最新价', '涨跌幅']])
    
except Exception as e:
    print(f"Error: {e}")
