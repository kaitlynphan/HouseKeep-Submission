import { RequestHandler } from "express";
import fs from "fs";
import path from "path";

// Load mock data from db.json
const mockDataPath = path.join(process.cwd(), "database", "db.json");
let mockData: any = null;

try {
  const rawData = fs.readFileSync(mockDataPath, "utf8");
  mockData = JSON.parse(rawData);
} catch (error) {
  console.error("Error loading mock data:", error);
  mockData = {
    users: [],
    homes: [],
    contacts: [],
    tasks: [],
    task_completions: [],
    alerts: [],
    attom_snapshots: []
  };
}

// Use the existing data from db.json - no need to create demo users

export const getMockData: RequestHandler = (req, res) => {
  res.json({ success: true, data: mockData });
};

export const getMockUserData: RequestHandler = (req, res) => {
  const { userId } = req.params;
  
  // Find user in mock data
  const user = mockData.users.find((u: any) => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, error: "User not found" });
  }

  // Get user's home
  const home = mockData.homes.find((h: any) => h.user_id === userId);
  
  // Get user's contacts
  const contacts = mockData.contacts.filter((c: any) => c.user_id === userId);
  
  // Get home's tasks
  const tasks = home ? mockData.tasks.filter((t: any) => t.home_id === home.id) : [];
  
  // Get home's alerts
  const alerts = home ? mockData.alerts.filter((a: any) => a.home_id === home.id) : [];
  
  // Get home's attom snapshots
  const attomSnapshots = home ? mockData.attom_snapshots.filter((s: any) => s.home_id === home.id) : [];

  res.json({
    success: true,
    data: {
      user,
      home,
      contacts,
      tasks,
      alerts,
      attomSnapshots
    }
  });
};

export const createMockUser: RequestHandler = (req, res) => {
  const { username, displayName, email, phone, password } = req.body;
  
  if (!username || !displayName || !email || !password) {
    return res.status(400).json({ success: false, error: "All fields are required" });
  }

  // Check if user already exists
  const existingUser = mockData.users.find((u: any) => u.username === username || u.email === email);
  if (existingUser) {
    return res.status(409).json({ success: false, error: "Username or email already exists" });
  }

  // Create new user
  const newUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    username,
    display_name: displayName,
    email,
    phone_e164: phone,
    password_hash: `mock_hash_${password}`, // Mock password hash
    created_at: new Date().toISOString()
  };

  mockData.users.push(newUser);
  
  // Save updated mock data back to file
  try {
    fs.writeFileSync(mockDataPath, JSON.stringify(mockData, null, 2));
  } catch (error) {
    console.error("Error saving mock data:", error);
  }

  res.json({ success: true, userId: newUser.id, message: "User created successfully" });
};

export const createMockHome: RequestHandler = (req, res) => {
  const { userId, homeData } = req.body;
  
  if (!userId || !homeData) {
    return res.status(400).json({ success: false, error: "User ID and home data are required" });
  }

  // Create new home
  const newHome = {
    id: `home_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    user_id: userId,
    address_text: `${homeData.address.street}, ${homeData.address.city}, ${homeData.address.state} ${homeData.address.postalCode}`,
    latitude: homeData.latitude || 41.8781,
    longitude: homeData.longitude || -87.6298,
    building_type: homeData.buildingType,
    year_built: homeData.yearBuilt,
    bedrooms: homeData.householdMembers || 1,
    bathrooms: homeData.hasPets ? 1.5 : 1.0,
    has_central_ac: homeData.laundryInUnit || false,
    pets: homeData.hasPets ? 1 : 0,
    smokers: 0,
    floor: "1",
    material: "brick",
    evac_map_path: homeData.evacuationPlanImageDataUrl || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  mockData.homes.push(newHome);

  // Create emergency contact if provided
  if (homeData.emergencyContact) {
    const newContact = {
      id: `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      name: homeData.emergencyContact.name,
      phone_e164: homeData.emergencyContact.phone,
      relationship: "Emergency Contact",
      is_primary: homeData.emergencyContact.isPrimary || true,
      created_at: new Date().toISOString()
    };
    mockData.contacts.push(newContact);
  }

  // Save updated mock data back to file
  try {
    fs.writeFileSync(mockDataPath, JSON.stringify(mockData, null, 2));
  } catch (error) {
    console.error("Error saving mock data:", error);
  }

  res.json({ success: true, homeId: newHome.id, message: "Home created successfully" });
};

export const mockLogin: RequestHandler = (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ success: false, error: "Username and password are required" });
  }

  // Just use the first user from the JSON data (no real authentication)
  const user = mockData.users[0];
  if (!user) {
    return res.status(401).json({ success: false, error: "No user data available" });
  }

  res.json({
    success: true,
    userId: user.id,
    user: {
      id: user.id,
      username: user.username,
      display_name: user.display_name,
      email: user.email,
      phone: user.phone_e164
    },
    message: "Login successful"
  });
};
