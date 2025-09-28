import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { attomLookup } from "./routes/attom";
import { createHome, getUserProfile } from "./routes/profile";
import { register, login, checkUsername } from "./routes/auth";
import { 
  getMockData, 
  getMockUserData, 
  createMockUser, 
  createMockHome, 
  mockLogin 
} from "./routes/mock-data";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);
  app.post("/api/attom/property", attomLookup);
  
  // Mock Data API routes (for showcasing)
  app.get("/api/mock/data", getMockData);
  app.get("/api/mock/user/:userId", getMockUserData);
  app.post("/api/mock/user", createMockUser);
  app.post("/api/mock/home", createMockHome);
  app.post("/api/mock/login", mockLogin);
  
  // Profile API routes (keeping for fallback)
  app.post("/api/profile/home", createHome);
  app.get("/api/profile/user/:userId", getUserProfile);
  
  // Authentication API routes (keeping for fallback)
  app.post("/api/auth/register", register);
  app.post("/api/auth/login", login);
  app.get("/api/auth/check-username/:username", checkUsername);

  return app;
}
