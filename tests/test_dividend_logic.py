
import unittest
from unittest.mock import MagicMock, patch
import pandas as pd
from analytics.modules.market_cn.dividend import CNDividendStrategy

class TestDividendStrategy(unittest.TestCase):
    
    @patch('analytics.modules.market_cn.dividend.data_provider')
    @patch('analytics.modules.market_cn.dividend.ak')
    def test_roe_calculation(self, mock_ak, mock_dp):
        # 1. Mock 成分股数据
        mock_cons_df = pd.DataFrame({
            "成分券代码": ["000001", "600036"],
            "成分券名称": ["平安银行", "招商银行"],
            "权重": [0.15, 0.20] # 0.15%, 0.20%
        })
        # ak.index_stock_cons_weight_csindex 返回 Mock 数据
        mock_ak.index_stock_cons_weight_csindex.return_value = mock_cons_df
        
        # 2. Mock 实时行情数据 (spot_df)
        mock_spot_df = pd.DataFrame({
            "代码": ["000001", "600036"],
            "名称": ["平安银行", "招商银行"],
            "最新价": [10.5, 30.2],
            "涨跌幅": [1.5, -0.5],
            "市盈率-动态": [5.0, 6.0],
            "市净率": [0.5, 0.9],
            "总市值": [2000000000, 8000000000],
            "成交额": [50000000, 150000000],
        })
        mock_dp.get_stock_zh_a_spot.return_value = mock_spot_df
        
        # 3. 运行策略
        result = CNDividendStrategy.get_dividend_stocks(limit=5)
        
        # 4. 验证结果
        stocks = result['stocks']
        self.assertEqual(len(stocks), 2)
        
        # 验证平安银行 (PE=5.0, PB=0.5)
        # ROE = PB/PE = 0.5/5.0 = 0.10 = 10%
        # E/P = 1/PE = 1/5.0 = 0.20 = 20%
        pingan = next(s for s in stocks if s['code'] == '000001')
        self.assertEqual(pingan['pe_ratio'], 5.0)
        self.assertEqual(pingan['pb_ratio'], 0.5)
        self.assertEqual(pingan['roe'], 10.0)
        self.assertEqual(pingan['earnings_yield'], 20.0)
        
        # 验证招商银行 (PE=6.0, PB=0.9)
        # ROE = 0.9/6.0 = 0.15 = 15%
        # E/P = 1/6.0 = 0.1666... -> 16.67%
        zhaohang = next(s for s in stocks if s['code'] == '600036')
        self.assertEqual(zhaohang['roe'], 15.0)
        self.assertEqual(zhaohang['earnings_yield'], 16.67)
        
        print("✅ ROE Calculation Test Passed!")
        print(f"Pingan: PE={pingan['pe_ratio']}, PB={pingan['pb_ratio']} -> ROE={pingan['roe']}%")
        print(f"Zhaohang: PE={zhaohang['pe_ratio']}, PB={zhaohang['pb_ratio']} -> ROE={zhaohang['roe']}%")

if __name__ == '__main__':
    unittest.main()
