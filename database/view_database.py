#!/usr/bin/env python3
"""
Database viewer for HouseKeep
Simple script to view and explore the database contents
"""

import sqlite3
import json
from datetime import datetime
from database import HouseKeepDB

def format_datetime(dt_str):
    """Format datetime string for display"""
    if not dt_str:
        return "N/A"
    try:
        dt = datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
        return dt.strftime("%Y-%m-%d %H:%M:%S")
    except:
        return dt_str

def print_table(title, data, key_fields=None):
    """Print a table of data"""
    print(f"\n{'='*60}")
    print(f"📊 {title}")
    print(f"{'='*60}")
    
    if not data:
        print("No data found")
        return
    
    if key_fields:
        for item in data:
            print(f"\n🔹 {item.get('id', 'Unknown ID')}")
            for field in key_fields:
                value = item.get(field, 'N/A')
                if field in ['created_at', 'updated_at', 'last_completed_at', 'onset', 'expires_at']:
                    value = format_datetime(value)
                print(f"   {field}: {value}")
    else:
        # Print all fields
        for item in data:
            print(f"\n🔹 {item.get('id', 'Unknown ID')}")
            for key, value in item.items():
                if key in ['created_at', 'updated_at', 'last_completed_at', 'onset', 'expires_at']:
                    value = format_datetime(value)
                print(f"   {key}: {value}")

def main():
    """Main function to display database contents"""
    print("🏠 HouseKeep Database Viewer")
    print("="*60)
    
    db = HouseKeepDB()
    
    try:
        db.connect()
        
        # Get all data
        users = db.execute_query("SELECT * FROM Users")
        homes = db.execute_query("SELECT * FROM Homes")
        contacts = db.execute_query("SELECT * FROM Contacts")
        tasks = db.execute_query("SELECT * FROM Tasks")
        task_completions = db.execute_query("SELECT * FROM TaskCompletions")
        alerts = db.execute_query("SELECT * FROM Alerts")
        
        # Display Users
        print_table("Users", users, ['display_name', 'phone_e164', 'created_at'])
        
        # Display Homes
        print_table("Homes", homes, ['address_text', 'building_type', 'year_built', 'bedrooms', 'bathrooms', 'has_central_ac'])
        
        # Display Contacts
        print_table("Emergency Contacts", contacts, ['name', 'phone_e164', 'relationship', 'is_primary'])
        
        # Display Tasks
        print_table("Tasks", tasks, ['title', 'category', 'status', 'priority', 'next_due', 'frequency_days', 'why', 'how_markdown'])
        
        # Display Task Completions
        print_table("Task Completions", task_completions, ['completed_at', 'notes'])
        
        # Display Alerts
        print_table("Alerts", alerts, ['source', 'type', 'severity', 'headline', 'onset', 'expires_at'])
        
        # Summary
        print(f"\n{'='*60}")
        print("📈 Database Summary")
        print(f"{'='*60}")
        print(f"👥 Users: {len(users)}")
        print(f"🏠 Homes: {len(homes)}")
        print(f"📞 Emergency Contacts: {len(contacts)}")
        print(f"✅ Tasks: {len(tasks)}")
        print(f"🎯 Task Completions: {len(task_completions)}")
        print(f"⚠️  Alerts: {len(alerts)}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.disconnect()

if __name__ == "__main__":
    main()
