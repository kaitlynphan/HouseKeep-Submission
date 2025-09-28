import http.client
import json
import urllib.parse
import ssl
import streamlit as st
import pandas as pd


st.write("Hello, Streamlit!")


def get_property_data(address1, address2, api_key, save_path="ATTOM_output.json"):
    """
    Get property data from Attom API for a given address and save JSON to file
    """
    try:
        # Create SSL context that doesn't verify certificates (for testing)
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        
        # Create connection with SSL context
        conn = http.client.HTTPSConnection("api.gateway.attomdata.com", context=ssl_context)
        
        # Prepare headers
        headers = {
            'accept': "application/json",
            'apikey': api_key,
        }
        
        # URL encode the address parameters
        address1_encoded = urllib.parse.quote(address1)
        address2_encoded = urllib.parse.quote(address2)
        
        # Construct the API endpoint
        endpoint = f"/propertyapi/v1.0.0/property/detail?address1={address1_encoded}&address2={address2_encoded}"
        
        # Make the request
        conn.request("GET", endpoint, headers=headers)
        
        # Get response
        res = conn.getresponse()
        data = res.read()
        
        # Parse JSON response into Python dict
        response_data = json.loads(data.decode("utf-8"))

        # Save the parsed Python object to JSON file
        with open(save_path, "w", encoding="utf-8") as f:
            json.dump(response_data, f, indent=2, ensure_ascii=False)
        
        # Close connection
        conn.close()
        
        return response_data, res.status
        
    except Exception as e:
        print(f"Error connecting to Attom API: {e}")
        return None, None


def main():
    # API key
    api_key = "703baad6677f664ea518b7538dca8208"
    
    # Random Chicago address for testing
    chicago_address1 = "3111 N RACINE AVE"
    chicago_address2 = "Chicago, IL"
    
    print(f"Testing Attom API with address: {chicago_address1}, {chicago_address2}")
    print("-" * 60)
    
    # Get property data
    response_data, status_code = get_property_data(
        chicago_address1, 
        chicago_address2, 
        api_key, 
        save_path="TESTINGATTOM.json"
    )
    
    if response_data and status_code == 200:
        print("✅ API call successful!")
        print(f"Status Code: {status_code}")
        print("\nResponse Data (truncated):")
        print(json.dumps(response_data, indent=2)[:500] + "...\n")  # truncate preview
        print("📂 Saved JSON to TESTINGATTOM.json")
    else:
        print("❌ API call failed!")
        if status_code:
            print(f"Status Code: {status_code}")
        if response_data:
            print("Response:")
            print(json.dumps(response_data, indent=2))


if __name__ == "__main__":
    main()
