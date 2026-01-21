import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

from analytics.core.patch import apply_patches
apply_patches()

import akshare as ak
import pandas as pd
from analytics.modules.market_cn.bonds import CNBonds

def test_bonds():
    print("\n🌐 Testing ak.bond_china_yield() [Short Range: 20260101+]...")
    try:
        df = ak.bond_china_yield(start_date="20260101", end_date="20261231")
        print(f"✅ Retrieved {len(df)} rows.")
        
        if "曲线名称" in df.columns:
            df = df[df["曲线名称"] == "中债国债收益率曲线"]
            
        print(f"✅ Filtered Treasury rows: {len(df)}")
        
        if not df.empty:
            print("Columns:", df.columns.tolist())
            last_row = df.iloc[-1]
            for col, val in last_row.items():
                print(f"{col}: {val}")
    except Exception as e:
        print(f"❌ bond_china_yield failed: {e}")
            
    except Exception as e:
        print(f"❌ Failed: {e}")

if __name__ == "__main__":
    test_bonds()
