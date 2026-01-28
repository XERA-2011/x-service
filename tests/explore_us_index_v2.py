import akshare as ak
try:
    print("Trying get_us_index_sina aliases...")
    # Check dir(ak) for us indices
    print([x for x in dir(ak) if 'us' in x and 'index' in x])
except Exception as e:
    print(e)
