import akshare as ak
import pandas as pd

print("Testing stock_us_hist for PGJ...")
try:
    # Attempt 1: 105.PGJ
    df = ak.stock_us_hist(symbol='105.PGJ', adjust="qfq")
    print("Attempt 1 Result:")
    if not df.empty:
        print(df.tail())
    else:
        print("Empty DataFrame")
except Exception as e:
    print(f"Attempt 1 Failed: {e}")

print("\nTesting alternate symbols...")
try:
    # Attempt 2: PGJ (without prefix)
    df = ak.stock_us_hist(symbol='PGJ', adjust="qfq")
    print("Attempt 2 Result:")
    if not df.empty:
        print(df.tail())
    else:
        print("Empty DataFrame")
except Exception as e:
    print(f"Attempt 2 Failed: {e}")

print("\nTesting stock_us_daily with PGJ...")
try:
    df = ak.stock_us_daily(symbol="PGJ", adjust="qfq")
    print("stock_us_daily Result:")
    if df is not None and not df.empty:
        print(df.tail())
    else:
        print("Empty/None")
except Exception as e:
    print(f"stock_us_daily Failed: {e}")
