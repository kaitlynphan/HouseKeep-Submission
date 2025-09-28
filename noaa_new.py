"""
NOAA Latest Weather Alerts Script
---------------------------------

Fetches:
    - Most recent weather alert for a given latitude/longitude

    - This script will be pulled by database_schema at 5 min intervals to provide live severe weather alerts
"""

import requests

# ========================
# USER INPUTS
# ========================
LAT = 41.8659   # Example: Chicago, IL
LON = -87.6256

# ========================
# CONFIG
# ========================
BASE_WEATHER = "https://api.weather.gov"
USER_AGENT = "noaa-client (me@myemail.com)"


def get_latest_alert(lat, lon):
    """Fetch the most recent NOAA alert for a given location."""
    url = f"{BASE_WEATHER}/alerts?point={lat},{lon}&limit=1"
    r = requests.get(url, headers={"User-Agent": USER_AGENT})
    r.raise_for_status()
    alerts = r.json().get("features", [])
    if alerts:
        props = alerts[0]["properties"]
        return {
            "Event": props.get("headline"),
            "Severity": props.get("severity"),
            "Effective": props.get("effective"),
            "Expires": props.get("expires"),
            "Description": props.get("description")
        }
    return None


def main():
    print("\n=== NOAA Latest Weather Alert ===\n")

    alert = get_latest_alert(LAT, LON)
    if alert:
        print("Latest Alert:")
        for k, v in alert.items():
            print(f"{k}: {v}")
    else:
        print("No recent alerts found.")


if __name__ == "__main__":
    main()