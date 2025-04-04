import requests
import json
import sys

def test_auth(base_url="http://localhost:8000"):
    """
    Test authentication functionality by:
    1. Creating a test user
    2. Logging in with the test user
    3. Fetching user info with the token
    """
    
    # Define test user data
    test_user = {
        "name": "admin",
        "email": "admin@test.com",
        "password": "password"
    }
    
    # Step 1: Create a test user (signup)
    print("=== Testing User Signup ===")
    try:
        signup_response = requests.post(
            f"{base_url}/api/auth/signup",
            json=test_user
        )
        
        if signup_response.status_code == 201:
            print("✅ User created successfully")
        elif signup_response.status_code == 400 and "Email already registered" in signup_response.text:
            print("ℹ️ User already exists, continuing with login test")
        else:
            print(f"❌ Failed to create user: {signup_response.status_code}")
            print(signup_response.text)
            if signup_response.status_code != 400:  # Only exit if not a duplicate email error
                sys.exit(1)
            
    except Exception as e:
        print(f"❌ Error during signup: {str(e)}")
        sys.exit(1)
    
    # Step 2: Login with test user
    print("\n=== Testing User Login ===")
    try:
        login_data = {
            "email": test_user["email"],
            "password": test_user["password"]
        }
        
        login_response = requests.post(
            f"{base_url}/api/auth/login",
            json=login_data
        )
        
        if login_response.status_code == 200:
            print("✅ Login successful")
            login_json = login_response.json()
            token = login_json.get("access_token")
            user_info = login_json.get("user")
            print(f"Token received: {token[:15]}...")
            print(f"User info: {json.dumps(user_info, indent=2)}")
        else:
            print(f"❌ Login failed: {login_response.status_code}")
            print(login_response.text)
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ Error during login: {str(e)}")
        sys.exit(1)
    
    # Step 3: Get current user with token
    print("\n=== Testing Token Authentication ===")
    try:
        me_response = requests.get(
            f"{base_url}/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        if me_response.status_code == 200:
            print("✅ Token authentication successful")
            print(f"User data: {json.dumps(me_response.json(), indent=2)}")
        else:
            print(f"❌ Token authentication failed: {me_response.status_code}")
            print(me_response.text)
            
    except Exception as e:
        print(f"❌ Error during token authentication: {str(e)}")
    
    print("\n=== Authentication Test Complete ===")
    print("You can use these credentials to login:")
    print(f"Email: {test_user['email']}")
    print(f"Password: {test_user['password']}")

if __name__ == "__main__":
    # You can provide a custom base URL as a command line argument
    base_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"
    test_auth(base_url)