from analytics.modules.market_us.leaders import USMarketLeaders
from analytics.core import cache
import json

cache.delete('market_us:indices')
print("Cache deleted.")
print("Fetching new data...")
data = USMarketLeaders.get_leaders()
print(json.dumps(data, ensure_ascii=False))
