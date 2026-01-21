import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

try:
    from analytics.core.patch import apply_patches
except ImportError:
    # Fallback if running outside of expected structure, though we appended cwd
    print("Could not import patch, trying without...")
    def apply_patches(): pass

import akshare as ak
import pandas as pd

def test_leaders():
    # Apply the camouflage patch
    print("🛡️ Applying patches...")
    apply_patches()

    print("\n🌐 Testing ak.stock_board_industry_name_em()...")

    try:
        df = ak.stock_board_industry_name_em()
        print("\n✅ Success!")
        print(f"Retrieved {len(df)} rows.")
        
        if not df.empty and "涨跌幅" in df.columns:
            print("\n📈 Top 5 Gainers:")
            print(df.sort_values("涨跌幅", ascending=False).head(5)[["板块名称", "涨跌幅", "领涨股票"]])
        else:
            print("Dataframe is empty or missing columns.")
            print(df.head())

    except Exception as e:
        print(f"\n❌ Failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_leaders()
