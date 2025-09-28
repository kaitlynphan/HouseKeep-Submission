#!/usr/bin/env python3
"""
Simple database utility for HouseKeep
"""

import sqlite3
from typing import List, Dict, Any

class HouseKeepDB:
    """Simple database connection class for HouseKeep"""
    
    def __init__(self, db_path: str = "housekeep.db"):
        self.db_path = db_path
        self.conn = None
    
    def connect(self):
        """Connect to the database"""
        self.conn = sqlite3.connect(self.db_path)
        self.conn.row_factory = sqlite3.Row  # Enable column access by name
        return self.conn
    
    def disconnect(self):
        """Disconnect from the database"""
        if self.conn:
            self.conn.close()
            self.conn = None
    
    def execute_query(self, query: str, params: tuple = ()) -> List[Dict[str, Any]]:
        """Execute a SELECT query and return results as list of dictionaries"""
        if not self.conn:
            self.connect()
        
        cursor = self.conn.cursor()
        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
