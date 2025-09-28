-- HouseKeep Database Schema
-- SQLite database for home maintenance and emergency management

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Users table
CREATE TABLE Users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    phone_e164 TEXT,
    email TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Homes table
CREATE TABLE Homes (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    address_text TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    building_type TEXT CHECK (building_type IN ('apartment', 'condo', 'house', 'townhome', 'other')),
    year_built INTEGER,
    bedrooms INTEGER,
    bathrooms REAL,
    has_central_ac BOOLEAN DEFAULT 0,
    evac_map_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Contacts (Emergency) table
CREATE TABLE Contacts (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    home_id TEXT NOT NULL,
    name TEXT NOT NULL,
    phone_e164 TEXT NOT NULL,
    relationship TEXT,
    is_primary BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (home_id) REFERENCES Homes(id) ON DELETE CASCADE
);

-- Tasks table (simplified - no separate templates table)
CREATE TABLE Tasks (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    home_id TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Safety', 'Seasonal', 'General', 'Health')),
    why TEXT, -- Why this task is important
    how_markdown TEXT, -- Instructions for completing the task
    frequency_days INTEGER, -- For interval tasks
    seasonal_window TEXT CHECK (seasonal_window IN ('winter', 'spring', 'summer', 'fall')), -- For seasonal tasks
    visibility_rules_json TEXT, -- JSON string for conditional visibility
    next_due DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'snoozed', 'archived')),
    priority INTEGER DEFAULT 0,
    remind_channel TEXT DEFAULT 'none' CHECK (remind_channel IN ('none', 'calendar', 'sms')),
    last_completed_at DATETIME,
    evidence_path TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (home_id) REFERENCES Homes(id) ON DELETE CASCADE,
    -- Ensure either frequency_days OR seasonal_window is set, not both
    CHECK (
        (frequency_days IS NOT NULL AND seasonal_window IS NULL) OR
        (frequency_days IS NULL AND seasonal_window IS NOT NULL)
    )
);

-- TaskCompletions table
CREATE TABLE TaskCompletions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    task_id TEXT NOT NULL,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    evidence_path TEXT,
    FOREIGN KEY (task_id) REFERENCES Tasks(id) ON DELETE CASCADE
);

-- Alerts table (NWS/NOAA)
CREATE TABLE Alerts (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    home_id TEXT NOT NULL,
    source TEXT NOT NULL,
    type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('Minor', 'Moderate', 'Severe', 'Extreme')),
    headline TEXT NOT NULL,
    instruction TEXT,
    onset DATETIME NOT NULL,
    expires_at DATETIME NOT NULL,
    raw_json TEXT, -- JSON string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (home_id) REFERENCES Homes(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_homes_user_id ON Homes(user_id);
CREATE INDEX idx_contacts_home_id ON Contacts(home_id);
CREATE INDEX idx_tasks_home_id ON Tasks(home_id);
CREATE INDEX idx_tasks_next_due ON Tasks(next_due);
CREATE INDEX idx_tasks_status ON Tasks(status);
CREATE INDEX idx_tasks_category ON Tasks(category);
CREATE INDEX idx_task_completions_task_id ON TaskCompletions(task_id);
CREATE INDEX idx_alerts_home_id ON Alerts(home_id);
CREATE INDEX idx_alerts_onset ON Alerts(onset);
CREATE INDEX idx_alerts_expires_at ON Alerts(expires_at);

-- Create trigger to update updated_at timestamp on Homes
CREATE TRIGGER update_homes_updated_at 
    AFTER UPDATE ON Homes
    FOR EACH ROW
    BEGIN
        UPDATE Homes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
