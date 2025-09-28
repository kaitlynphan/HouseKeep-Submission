#!/usr/bin/env python3
"""
Database initialization script for HouseKeep
Creates SQLite database with all required tables and indexes
"""

import sqlite3
import os
from pathlib import Path

def init_database(db_path="housekeep.db"):
    """
    Initialize the HouseKeep SQLite database
    """
    # Remove existing database if it exists
    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"Removed existing database: {db_path}")
    
    # Read the schema file
    schema_file = Path(__file__).parent / "database_schema.sql"
    
    if not schema_file.exists():
        print(f"Error: Schema file not found: {schema_file}")
        return False
    
    try:
        # Connect to database (creates it if it doesn't exist)
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Read and execute schema
        with open(schema_file, 'r') as f:
            schema_sql = f.read()
        
        # Execute the schema using executescript for multiple statements
        cursor.executescript(schema_sql)
        
        # Commit changes
        conn.commit()
        
        # Verify tables were created
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
        tables = cursor.fetchall()
        
        print(f"✅ Database created successfully: {db_path}")
        print(f"📊 Tables created: {len(tables)}")
        for table in tables:
            print(f"   - {table[0]}")
        
        # Show table schemas
        print("\n📋 Table Schemas:")
        for table in tables:
            table_name = table[0]
            cursor.execute(f"PRAGMA table_info({table_name});")
            columns = cursor.fetchall()
            print(f"\n{table_name}:")
            for col in columns:
                col_id, name, type_name, not_null, default_val, pk = col
                pk_str = " (PK)" if pk else ""
                not_null_str = " NOT NULL" if not_null else ""
                default_str = f" DEFAULT {default_val}" if default_val else ""
                print(f"  - {name}: {type_name}{not_null_str}{default_str}{pk_str}")
        
        conn.close()
        return True
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_database(db_path="housekeep.db"):
    """
    Test the database with some sample data
    """
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("\n🧪 Testing database with sample data...")
        
        # Insert a test user
        cursor.execute("""
            INSERT INTO Users (username, display_name, phone_e164, email, password_hash) 
            VALUES (?, ?, ?, ?, ?)
        """, ("testuser", "Test User", "+1234567890", "test@example.com", "hashed_password_123"))
        
        user_id = cursor.lastrowid
        print(f"✅ Created test user with ID: {user_id}")
        
        # Insert a test home
        cursor.execute("""
            INSERT INTO Homes (user_id, address_text, latitude, longitude, building_type, year_built, bedrooms, bathrooms, has_central_ac)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (user_id, "1234 N Michigan Ave, Chicago, IL 60605", 41.866525, -87.624616, "house", 1947, 3, 2.5, 1))
        
        home_id = cursor.lastrowid
        print(f"✅ Created test home with ID: {home_id}")
        
        # Insert a test contact
        cursor.execute("""
            INSERT INTO Contacts (home_id, name, phone_e164, relationship, is_primary)
            VALUES (?, ?, ?, ?, ?)
        """, (home_id, "Emergency Contact", "+1987654321", "Family", 1))
        
        print("✅ Created test emergency contact")
        
        # Insert a test task (simplified - no template needed)
        cursor.execute("""
            INSERT INTO Tasks (home_id, title, category, why, how_markdown, frequency_days, next_due, status, priority)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (home_id, "Test Smoke Detectors", "Safety", "Ensure fire safety", "Press test button on each detector", 30, "2024-02-15", "active", 1))
        
        print("✅ Created test task")
        
        # Insert a test alert
        cursor.execute("""
            INSERT INTO Alerts (home_id, source, type, severity, headline, instruction, onset, expires_at, raw_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (home_id, "NWS", "Freeze Warning", "Moderate", "Freeze Warning in effect", "Protect outdoor plumbing", "2024-01-15 18:00:00", "2024-01-16 10:00:00", '{"test": "data"}'))
        
        print("✅ Created test alert")
        
        conn.commit()
        conn.close()
        
        print("🎉 Database test completed successfully!")
        return True
        
    except sqlite3.Error as e:
        print(f"❌ Database test error: {e}")
        return False

if __name__ == "__main__":
    print("🏠 HouseKeep Database Initialization")
    print("=" * 40)
    
    # Initialize database
    if init_database():
        # Test with sample data
        test_database()
    else:
        print("❌ Database initialization failed")
