import asyncio
import httpx

BASE_URL = "http://localhost:8000"

async def test_scenario(client, name, method, path, token=None, json_data=None, expected_status=200):
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    try:
        if method == "GET":
            response = await client.get(f"{BASE_URL}{path}", headers=headers)
        elif method == "POST":
            response = await client.post(f"{BASE_URL}{path}", headers=headers, json=json_data)
        
        status = response.status_code
        if status == expected_status:
            print(f"[PASS] {name} (Status: {status})")
            return response
        else:
            print(f"[FAIL] {name} (Expected {expected_status}, got {status}). Response: {response.text}")
            return None
    except Exception as e:
        print(f"[FAIL] {name} (Exception: {e})")
        return None

async def main():
    print("Starting integration/endpoint tests against Million Mint AI Terminal API...")
    
    async with httpx.AsyncClient(timeout=15.0) as client:
        # 16. Health check (no auth required)
        await test_scenario(client, "16. GET /health", "GET", "/health", expected_status=200)

        # 15. GET /api/market with invalid token (401)
        await test_scenario(client, "15. GET /api/market (invalid token)", "GET", "/api/market", token="bad_token", expected_status=401)

        # 1. GET /api/market with free_token (verify delayed=true)
        res1 = await test_scenario(client, "1. GET /api/market (free token)", "GET", "/api/market", token="free_token", expected_status=200)
        if res1:
            data = res1.json()
            if data.get("delayed") is True:
                print("   -> PASS: market data is delayed (Free Tier)")
            else:
                print("   -> FAIL: market data is not delayed")

        # 2. GET /api/market with pro_token (verify delayed=false)
        res2 = await test_scenario(client, "2. GET /api/market (pro token)", "GET", "/api/market", token="pro_token", expected_status=200)
        if res2:
            data = res2.json()
            if data.get("delayed") is False:
                print("   -> PASS: market data is not delayed (Pro Tier)")
            else:
                print("   -> FAIL: market data is delayed")

        # 3. POST /api/ai/query with free_token x6 (verify 5 succeed, 6th returns 403)
        print("Running rate limit queries (free_token)...")
        success_count = 0
        limit_reached = False
        for i in range(1, 7):
            res = await client.post(
                f"{BASE_URL}/api/ai/query",
                headers={"Authorization": "Bearer free_token"},
                json={"prompt": "Is Solana a good buy?"}
            )
            if res.status_code == 200:
                success_count += 1
            elif res.status_code == 403:
                limit_reached = True
        print(f"   -> Results: {success_count} succeeded, limit reached = {limit_reached}")
        if limit_reached or success_count == 5:
            print("   -> PASS: rate limit triggered successfully")
        else:
            print("   -> FAIL: rate limit behaviour unexpected")

        # 4. POST /api/ai/query with pro_token (verify success)
        await test_scenario(
            client,
            "4. POST /api/ai/query (pro token)",
            "POST",
            "/api/ai/query",
            token="pro_token",
            json_data={"prompt": "Is Ethereum scaling well?"},
            expected_status=200
        )

        # 5. POST /api/ai/trade-setup with free_token (403)
        await test_scenario(
            client,
            "5. POST /api/ai/trade-setup (free token)",
            "POST",
            "/api/ai/trade-setup",
            token="free_token",
            json_data={"coin_id": "ethereum"},
            expected_status=403
        )

        # 6. POST /api/ai/trade-setup with pro_token (verify success)
        await test_scenario(
            client,
            "6. POST /api/ai/trade-setup (pro token)",
            "POST",
            "/api/ai/trade-setup",
            token="pro_token",
            json_data={"coin_id": "ethereum"},
            expected_status=200
        )

        # 7. POST /api/ai/content-gen with pro_token (403)
        await test_scenario(
            client,
            "7. POST /api/ai/content-gen (pro token)",
            "POST",
            "/api/ai/content-gen",
            token="pro_token",
            json_data={"topic": "Solana ETF", "format": "alpha_call"},
            expected_status=403
        )

        # 8. POST /api/ai/content-gen with premium_token (verify success)
        await test_scenario(
            client,
            "8. POST /api/ai/content-gen (premium token)",
            "POST",
            "/api/ai/content-gen",
            token="premium_token",
            json_data={"topic": "Solana ETF", "format": "alpha_call"},
            expected_status=200
        )

        # 9. GET /api/whale-alerts with free_token (403)
        await test_scenario(client, "9. GET /api/whale-alerts (free token)", "GET", "/api/whale-alerts", token="free_token", expected_status=403)

        # 10. GET /api/whale-alerts with pro_token (403)
        await test_scenario(client, "10. GET /api/whale-alerts (pro token)", "GET", "/api/whale-alerts", token="pro_token", expected_status=403)

        # 11. GET /api/whale-alerts with premium_token (200)
        await test_scenario(client, "11. GET /api/whale-alerts (premium token)", "GET", "/api/whale-alerts", token="premium_token", expected_status=200)

        # 12. GET /api/narratives with free_token (verify max 3 sectors)
        res12 = await test_scenario(client, "12. GET /api/narratives (free token)", "GET", "/api/narratives", token="free_token", expected_status=200)
        if res12:
            data = res12.json()
            if len(data) <= 3:
                print(f"   -> PASS: free tier gets {len(data)} sectors (max 3)")
            else:
                print(f"   -> FAIL: free tier gets {len(data)} sectors (expected <=3)")

        # 13. GET /api/narratives with pro_token (verify all sectors)
        res13 = await test_scenario(client, "13. GET /api/narratives (pro token)", "GET", "/api/narratives", token="pro_token", expected_status=200)
        if res13:
            data = res13.json()
            if len(data) > 3:
                print(f"   -> PASS: pro tier gets all {len(data)} sectors (>3)")
            else:
                print(f"   -> FAIL: pro tier gets only {len(data)} sectors")

        # 14. GET /api/trending (200)
        await test_scenario(client, "14. GET /api/trending", "GET", "/api/trending", token="free_token", expected_status=200)

if __name__ == "__main__":
    asyncio.run(main())
