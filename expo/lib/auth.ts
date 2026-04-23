import AsyncStorage from "@react-native-async-storage/async-storage";
import { databaseService } from "./database";
import * as bcrypt from "bcryptjs";

const STORAGE_KEY = "@timeline_auth";

export interface User {
  username: string;
}

// Event listeners for auth state changes
type AuthListener = () => void;
const authListeners: AuthListener[] = [];

export function onAuthStateChange(listener: AuthListener) {
  authListeners.push(listener);
  return () => {
    const index = authListeners.indexOf(listener);
    if (index > -1) {
      authListeners.splice(index, 1);
    }
  };
}

function notifyAuthStateChange() {
  authListeners.forEach(listener => listener());
}

class AuthService {
  private currentUser: User | null = null;

  async login(username: string, password: string): Promise<User> {
    try {
      // Try database authentication first
      const user = await databaseService.login(username, password);
      if (user && user.username) {
        this.currentUser = { username: user.username };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentUser));
        notifyAuthStateChange();
        return this.currentUser;
      }
    } catch (error) {
      // Fallback to demo mode if database is not available
      console.warn("Database login failed, using demo mode:", error);
    }

    throw new Error("Geçersiz kullanıcı adı veya şifre");
  }

  async register(username: string, password: string): Promise<User> {
    try {
      // Hash password before storing
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await databaseService.register(username, hashedPassword);
      
      if (user && user.username) {
        this.currentUser = { username: user.username };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentUser));
        notifyAuthStateChange();
        return this.currentUser;
      }
    } catch (error) {
      console.error("Registration failed:", error);
    }

    throw new Error("Kayıt başarısız oldu");
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    await AsyncStorage.removeItem(STORAGE_KEY);
    notifyAuthStateChange();
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const userData = JSON.parse(stored);
        // Ensure we have a valid user object with username
        if (userData && userData.username) {
          this.currentUser = { username: userData.username };
          return this.currentUser;
        }
      }
    } catch (error) {
      console.error("Error loading user:", error);
    }

    return null;
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }
}

export const authService = new AuthService();

// Legacy functions for backward compatibility
export async function loginUser(username: string, password: string) {
  try {
    const user = await authService.login(username, password);
    return { success: true, user };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  return await authService.getCurrentUser();
}
