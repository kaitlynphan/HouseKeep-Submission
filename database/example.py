# example_main.py
from db_props import init_db, find_user_by_phone_or_name, create_user, import_property_json_file

def main():
    # 1) Ensure DB + schema exist
    init_db()
    print("DB initialized.")

    # 2) Ensure we have a user (in a real app you'd look up authenticated user)
    display_name = "jeronimo"
    phone = "+12135551234"   # optional

    user_id = find_user_by_phone_or_name(phone, display_name)
    if not user_id:
        user_id = create_user(display_name=display_name, phone_e164=phone)
        print("Created user:", user_id)
    else:
        print("Found user:", user_id)

    # 3) Path to the JSON file you received from the external API for the address
    # For example: property_204341463.json  (the content you pasted)
    json_path = "../TESTINGATTOM.json"

    # 4) Import the property JSON file and map it into Homes
    try:
        home_id = import_property_json_file(user_id=user_id, json_path=json_path)
        print("Inserted / found home id:", home_id)
    except Exception as e:
        print("Failed importing property JSON:", e)

if __name__ == "__main__":
    main()
