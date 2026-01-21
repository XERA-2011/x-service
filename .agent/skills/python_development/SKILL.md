---
name: Python Development Standards
description: Guidelines for Python coding, testing, and debugging in x-analytics
---

# Development Standards

## 1. Project Architecture
- **Core (`analytics/core/`)**: Infrastructure code only.
  - `config.py`: Centralized configuration (TTLs, Intervals).
  - `cache.py`: Redis interface and decorators.
  - `patch.py`: Anti-scraping patches (User-Agent, Headers).
  - `throttler.py`: Global request rate limiting.
- **Modules (`analytics/modules/`)**: Business logic grouped by domain (e.g., `market_cn`, `metals`).
  - Modules should focus on data fetching and processing.
  - **Stateless**: Modules should not hold state; rely on Redis cache.

## 2. Data Fetching & Anti-Scraping
Direct calls to `akshare` are **FORBIDDEN** in production code. You MUST use the shared infrastructure to prevent blocking.

- **Use Retry Logic**:
  ```python
  from ...core.utils import akshare_call_with_retry
  df = akshare_call_with_retry(ak.some_api, symbol="...", max_retries=3)
  ```
- **Use Throttling**: Heavy interfaces must pass through `fetch_with_throttle`.
- **Patching**: Entry points (scripts/server) must verify `apply_patches()` is called.

## 3. Caching Strategy
- **Centralized TTL**: Do NOT hardcode TTLs. Use `settings.CACHE_TTL["key"]`.
- **Decorator Usage**:
  ```python
  @cached("namespace:key", ttl=settings.CACHE_TTL["category"])
  def get_data(): ...
  ```
- **Passive Mode**: In "Extreme Rate Limiting" mode, ensure code handles cache misses gracefully (return None/Loading) or triggers async separate from the user request if possible.

## 4. Error Handling
- **Never Crash**: API endpoints must return a valid JSON structure even on failure.
  ```python
  except Exception as e:
      print(f"❌ Error: {e}")
      return {"error": str(e), "data": []} # Graceful fallback
  ```
- **Safe Conversions**: Use `safe_float(val, default=None)` for financial data. Avoid `float()` directly on API responses.

## 5. Testing and Debugging
1. **Test Location**: All debug scripts, temporary test files, and exploration code **MUST** be created in the `tests/` directory.
   - ❌ Do NOT create debug scripts in the project root.
   - ✅ Create `tests/debug_market.py` instead of `debug_market.py`.
2. **File Naming**: Debug scripts should be prefixed with `debug_` or `test_`.
