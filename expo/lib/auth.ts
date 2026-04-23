import AsyncStorage from "@react-native-async-storage/async-storage";
import { databaseService } from "./database";

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
    
    // Demo mode fallback
    const demoUsers = [
      { username: "admin", password: "admin123" },
      { username: "demo", password: "demo123" }
    ];

    const demoUser = demoUsers.find(
      u => u.username === username && u.password === password
    );

    if (demoUser) {
      const user = { username: demoUser.username };
      this.currentUser = user;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      notifyAuthStateChange();
      return user;
    }

    throw new Error("Geçersiz kullanıcı adı veya şifre");
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
