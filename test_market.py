from analytics.market import MarketAnalysis
import json

print("Testing MarketAnalysis.get_market_overview_v2()...")
try:
    result = MarketAnalysis.get_market_overview_v2()
    print(json.dumps(result, indent=2, ensure_ascii=False))
except Exception as e:
    print(f"Error: {e}")
