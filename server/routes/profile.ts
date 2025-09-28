import type { RequestHandler } from "express";
import sqlite3 from "sqlite3";
import path from "path";

// Database path
const DB_PATH = path.join(__dirname, "../../database/housekeep.db");

interface UserData {
  name: string;
  phone: string;
}

interface HomeData {
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
  buildingType: string;
  yearBuilt: number;
  emergencyContact: {
    name: string;
    phone: string;
    isPrimary: boolean;
  };
  latitude?: number;
  longitude?: number;
  evacuationMapFile?: any;
}

// Create user in database
export const createUser: RequestHandler = async (req, res) => {
  try {
    const { name, phone }: UserData = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({ 
        success: false, 
        error: "Name and phone are required" 
      });
    }

    const db = new sqlite3.Database(DB_PATH);
    
    const userId = await new Promise<string>((resolve, reject) => {
      db.run(
        "INSERT INTO Users (display_name, phone_e164) VALUES (?, ?)",
        [name, phone],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID.toString());
          }
        }
      );
    });

    db.close();

    res.json({ 
      success: true, 
      userId,
      message: "User created successfully" 
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to create user" 
    });
  }
};

// Create home in database
export const createHome: RequestHandler = async (req, res) => {
  try {
    const { userId, homeData }: { userId: string; homeData: HomeData } = req.body;
    
    if (!userId || !homeData) {
      return res.status(400).json({ 
        success: false, 
        error: "User ID and home data are required" 
      });
    }

    const db = new sqlite3.Database(DB_PATH);
    
    // Create home
    const homeId = await new Promise<string>((resolve, reject) => {
      db.run(
        `INSERT INTO Homes (user_id, address_text, latitude, longitude, building_type, year_built, has_central_ac) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          `${homeData.address.street}, ${homeData.address.city}, ${homeData.address.state} ${homeData.address.postalCode}`,
          homeData.latitude || null,
          homeData.longitude || null,
          homeData.buildingType,
          homeData.yearBuilt,
          false // Default to no central AC
        ],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID.toString());
          }
        }
      );
    });

    // Create emergency contact
    await new Promise<void>((resolve, reject) => {
      db.run(
        "INSERT INTO Contacts (home_id, name, phone_e164, relationship, is_primary) VALUES (?, ?, ?, ?, ?)",
        [
          homeId,
          homeData.emergencyContact.name,
          homeData.emergencyContact.phone,
          "Emergency Contact",
          homeData.emergencyContact.isPrimary ? 1 : 0
        ],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });

    db.close();

    res.json({ 
      success: true, 
      homeId,
      message: "Home profile created successfully" 
    });
  } catch (error) {
    console.error("Error creating home:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to create home profile" 
    });
  }
};

// Get user profile
export const getUserProfile: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const db = new sqlite3.Database(DB_PATH);
    
    const user = await new Promise<any>((resolve, reject) => {
      db.get(
        "SELECT * FROM Users WHERE id = ?",
        [userId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });

    if (!user) {
      db.close();
      return res.status(404).json({ 
        success: false, 
        error: "User not found" 
      });
    }

    // Get user's homes
    const homes = await new Promise<any[]>((resolve, reject) => {
      db.all(
        "SELECT * FROM Homes WHERE user_id = ?",
        [userId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });

    // Get contacts for each home
    const homesWithContacts = await Promise.all(
      homes.map(async (home) => {
        const contacts = await new Promise<any[]>((resolve, reject) => {
          db.all(
            "SELECT * FROM Contacts WHERE home_id = ?",
            [home.id],
            (err, rows) => {
              if (err) {
                reject(err);
              } else {
                resolve(rows);
              }
            }
          );
        });
        return { ...home, contacts };
      })
    );

    db.close();

    res.json({ 
      success: true, 
      user: {
        ...user,
        homes: homesWithContacts
      }
    });
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to get user profile" 
    });
  }
};
