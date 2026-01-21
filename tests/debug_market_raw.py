import requests
import akshare as ak
import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

from analytics.core.patch import apply_patches

# Apply patches FIRST so we wrap the patched version
apply_patches()

# Capture the currently active request method (which includes the patch)
_patched_request = requests.Session.request

def debug_wrapper(self, method, url, *args, **kwargs):
    print(f"🚀 Debug Request: {method} {url}")
    # Print headers being sent
    headers = kwargs.get('headers', {})
    print(f"📤 Request Headers: {headers.keys()}")
    
    try:
        resp = _patched_request(self, method, url, *args, **kwargs)
        print(f"📥 Response Status: {resp.status_code}")
        try:
            # Try to decode first 500 chars safely
            content_preview = resp.text[:500]
            print(f"📄 First 500 chars: {content_preview!r}") 
        except Exception:
            print("📄 Binary content or decode error")
        return resp
    except Exception as e:
        print(f"❌ Request Exception: {e}")
        raise

requests.Session.request = debug_wrapper

print("\n--- Testing Leaders (stock_board_industry_name_em) ---")
try:
    df = ak.stock_board_industry_name_em("行业板块")
    print(f"✅ Leaders Success: {len(df)} rows")
except Exception as e:
    print(f"❌ Leaders Failed: {e}")

print("\n--- Testing Heat (stock_zh_a_spot_em) ---")
try:
    df = ak.stock_zh_a_spot_em()
    print(f"✅ Heat Success: {len(df)} rows")
except Exception as e:
    print(f"❌ Heat Failed: {e}")
