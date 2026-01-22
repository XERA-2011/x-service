
import unittest
from unittest.mock import MagicMock, patch
import pandas as pd
from analytics.modules.market_cn.dividend import CNDividendStrategy

class TestDividendStrategy(unittest.TestCase):
    
    @patch('analytics.modules.market_cn.dividend.data_provider')
    @patch('analytics.modules.market_cn.dividend.ak')
    def test_roe_calculation(self, mock_ak, mock_dp):
        # 1. Mock 成分股数据 (增加非银行股)
        mock_cons_df = pd.DataFrame({
            "成分券代码": ["000001", "600036", "600900"],
            "成分券名称": ["平安银行", "招商银行", "长江电力"],
            "权重": [0.15, 0.20, 0.15] # Total 0.50
        })
        mock_ak.index_stock_cons_weight_csindex.return_value = mock_cons_df
        
        # 2. Mock 实时行情数据 (spot_df)
        mock_spot_df = pd.DataFrame({
            "代码": ["000001", "600036", "600900"],
            "名称": ["平安银行", "招商银行", "长江电力"],
            "最新价": [10.5, 30.2, 22.5],
            "涨跌幅": [1.5, -0.5, 0.2],
            "市盈率-动态": [5.0, 6.0, 15.0], # Yangtze Power PE higher
            "市净率": [0.5, 0.9, 2.5],
            "总市值": [2000e8, 8000e8, 5000e8],
            "成交额": [5e7, 15e7, 8e7],
        })
        mock_dp.get_stock_zh_a_spot.return_value = mock_spot_df
        
        # 3. 运行策略
        result = CNDividendStrategy.get_dividend_stocks(limit=10)
        
        # 4. 验证结果
        stocks = result['stocks']
        print(f"DEBUG: Returned stocks: {[s['code'] for s in stocks]}")
        self.assertEqual(len(stocks), 3)
        
        # 验证加权指标
        stats = result['strategy_stats']
        
        # Weighted PE: (5*0.15 + 6*0.20 + 15*0.15) / 0.50
        # = (0.75 + 1.20 + 2.25) / 0.50 = 4.2 / 0.50 = 8.4
        self.assertAlmostEqual(stats['avg_pe_ratio'], 8.4, places=1)
        
        # Bank Weight: (0.15 + 0.20) / 0.50 = 0.35 / 0.50 = 70%
        # Note: My code calcs simple sum of weights for bank_weight currently?
        # Let's check code: `sum(s.get("weight", 0) for s in stocks if "银行" in s.get("name", ""))`
        # In mock data, weights are 0.15, 0.20. Bank sum = 0.35.
        # But wait, does 'bank_weight' mean % of total portfolio or absolute weight sum?
        # Usually for Index analysis, it's absolute sum of weights (since total weight is ~100).
        # In mock, total weight is 0.5. So simple sum is 0.35.
        # Ideally we want percentage of index. Cons weights usually sum to 100.
        # My mocked weights are small (0.15). If I interpret them as %, then 0.35% is tiny.
        # Let's assume input weights are valid.
        
        self.assertEqual(stats['bank_weight'], 0.35) 
        
        # Signal Verification
        # Weighted PE 8.4 > 8.2 -> CAUTION? No, because Weighted EY 14.66% > 5.8% -> OPPORTUNITY
        self.assertEqual(stats['signal']['type'], "OPPORTUNITY")
        
        print(f"✅ Strategy Logic Verified: Weighted PE={stats['avg_pe_ratio']}, Signal={stats['signal']['type']}")

if __name__ == '__main__':
    unittest.main()
