import type { RequestHandler } from "express";
import sqlite3 from "sqlite3";
import bcrypt from "bcrypt";
import path from "path";

// Database path
const DB_PATH = path.join(__dirname, "../../database/housekeep.db");

interface RegisterData {
  username: string;
  displayName: string;
  phone: string;
  email: string;
  password: string;
}

interface LoginData {
  username: string;
  password: string;
}

// Register new user
export const register: RequestHandler = async (req, res) => {
  try {
    const { username, displayName, phone, email, password }: RegisterData = req.body;
    
    if (!username || !displayName || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: "Username, display name, email, and password are required" 
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: "Password must be at least 6 characters long" 
      });
    }

    const db = new sqlite3.Database(DB_PATH);
    
    // Check if username or email already exists
    const existingUser = await new Promise<any>((resolve, reject) => {
      db.get(
        "SELECT id FROM Users WHERE username = ? OR email = ?",
        [username, email],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });

    if (existingUser) {
      db.close();
      return res.status(400).json({ 
        success: false, 
        error: "Username or email already exists" 
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = await new Promise<string>((resolve, reject) => {
      db.run(
        "INSERT INTO Users (username, display_name, phone_e164, email, password_hash) VALUES (?, ?, ?, ?, ?)",
        [username, displayName, phone, email, passwordHash],
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
      message: "User registered successfully" 
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to register user" 
    });
  }
};

// Login user
export const login: RequestHandler = async (req, res) => {
  try {
    const { username, password }: LoginData = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: "Username and password are required" 
      });
    }

    const db = new sqlite3.Database(DB_PATH);
    
    // Find user by username or email
    const user = await new Promise<any>((resolve, reject) => {
      db.get(
        "SELECT * FROM Users WHERE username = ? OR email = ?",
        [username, username],
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
      return res.status(401).json({ 
        success: false, 
        error: "Invalid username or password" 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      db.close();
      return res.status(401).json({ 
        success: false, 
        error: "Invalid username or password" 
      });
    }

    // Get user's homes
    const homes = await new Promise<any[]>((resolve, reject) => {
      db.all(
        "SELECT * FROM Homes WHERE user_id = ?",
        [user.id],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });

    db.close();

    // Return user data (without password hash)
    const { password_hash, ...userWithoutPassword } = user;
    
    res.json({ 
      success: true, 
      user: {
        ...userWithoutPassword,
        homes
      },
      message: "Login successful" 
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to login" 
    });
  }
};

// Check if username is available
export const checkUsername: RequestHandler = async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username) {
      return res.status(400).json({ 
        success: false, 
        error: "Username is required" 
      });
    }

    const db = new sqlite3.Database(DB_PATH);
    
    const existingUser = await new Promise<any>((resolve, reject) => {
      db.get(
        "SELECT id FROM Users WHERE username = ?",
        [username],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });

    db.close();

    res.json({ 
      success: true, 
      available: !existingUser,
      message: existingUser ? "Username is taken" : "Username is available"
    });
  } catch (error) {
    console.error("Error checking username:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to check username" 
    });
  }
};
