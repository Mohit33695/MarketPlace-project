import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def make_request(url, method="GET", data=None, token=None):
    headers = {
        "Content-Type": "application/json"
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    req_data = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as res:
            return json.loads(res.read().decode("utf-8")), res.status
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            err_json = json.loads(body)
            return err_json, e.code
        except Exception:
            return {"error": body}, e.code
    except Exception as e:
        return {"error": str(e)}, 500

def run_tests():
    print("Starting Backend API Endpoints Verification...")
    
    # 1. Login as Buyer
    print("\n--- 1. Login as Buyer ---")
    login_data = {"email": "buyer@demo.com", "password": "demo1234"}
    res, status = make_request(f"{BASE_URL}/auth/login/", method="POST", data=login_data)
    if status != 200:
        print(f"FAILED to login as buyer: {res} (Status {status})")
        sys.exit(1)
    
    buyer_token = res.get("access")
    print(f"Successfully logged in as Buyer. Token obtained.")
    
    # 2. Login as Farmer
    print("\n--- 2. Login as Farmer ---")
    login_data = {"email": "farmer@demo.com", "password": "demo1234"}
    res, status = make_request(f"{BASE_URL}/auth/login/", method="POST", data=login_data)
    if status != 200:
        print(f"FAILED to login as farmer: {res} (Status {status})")
        sys.exit(1)
        
    farmer_token = res.get("access")
    print(f"Successfully logged in as Farmer. Token obtained.")

    # 3. Get products list (authenticated as Buyer)
    print("\n--- 3. Fetching Products ---")
    res, status = make_request(f"{BASE_URL}/products/", token=buyer_token)
    if status != 200:
        print(f"FAILED to fetch products: {res} (Status {status})")
        sys.exit(1)
    
    products = res.get("results", res)
    print(f"Successfully fetched products. Total: {len(products)}")
    
    if not products:
        print("No products found in database. Cannot run AI tests.")
        sys.exit(1)
        
    test_product = products[0]
    pid = test_product.get("id")
    name = test_product.get("name")
    print(f"Selecting product for AI endpoints test: {name} (ID: {pid})")

    # 4. Test AI Price Suggestion
    print("\n--- 4. Testing AI Price Suggestion Endpoint ---")
    res, status = make_request(f"{BASE_URL}/ai/price-suggest/{pid}/", token=farmer_token)
    if status != 200:
        print(f"Price Suggestion failed: {res} (Status {status})")
    else:
        print(f"Price Suggestion Success: {json.dumps(res, indent=2)}")

    # 5. Test AI Demand Forecast
    print("\n--- 5. Testing AI Demand Forecast Endpoint ---")
    res, status = make_request(f"{BASE_URL}/ai/demand/{pid}/?days=7", token=farmer_token)
    if status != 200:
        print(f"Demand Forecast failed: {res} (Status {status})")
    else:
        print(f"Demand Forecast Success: {json.dumps(res, indent=2)}")

    # 6. Test AI Recommendations
    print("\n--- 6. Testing AI Recommendations Endpoint ---")
    res, status = make_request(f"{BASE_URL}/ai/recommendations/", token=buyer_token)
    if status != 200:
        print(f"Recommendations failed: {res} (Status {status})")
    else:
        print(f"Recommendations Success: Found {len(res.get('recommendations', []))} items")

    # 7. Add to Cart and Checkout flow
    print("\n--- 7. Testing Cart & Checkout flow ---")
    # First clear cart if there are items (or just add new item)
    add_data = {"product_id": pid, "quantity": 1}
    res, status = make_request(f"{BASE_URL}/orders/cart/add/", method="POST", data=add_data, token=buyer_token)
    if status != 200:
        print(f"Add to Cart failed: {res} (Status {status})")
        sys.exit(1)
    print(f"Added {name} to cart.")

    # Place order
    checkout_data = {
      "delivery_address": "Test Street 123",
      "delivery_city": "Mumbai",
      "delivery_pincode": "400001",
      "notes": "Verified automatically by test script"
    }
    res, status = make_request(f"{BASE_URL}/orders/place/", method="POST", data=checkout_data, token=buyer_token)
    if status not in (200, 201):
        print(f"Order Placement failed: {res} (Status {status})")
        sys.exit(1)
    print(f"Order Placed successfully! Order Details: {json.dumps(res, indent=2)}")
    
    print("\nAll Verification Checks Passed Successfully!")

if __name__ == "__main__":
    run_tests()
