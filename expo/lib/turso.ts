import { createClient } from "@libsql/client";

// Turso client oluştur
let client: ReturnType<typeof createClient> | null = null;

try {
  const url = process.env.EXPO_PUBLIC_TURSO_URL;
  const token = process.env.EXPO_PUBLIC_TURSO_TOKEN;

  if (url && token) {
    client = createClient({
      url,
      authToken: token,
    });
    console.log("✅ Turso connected successfully");
  } else {
    console.warn("⚠️ Turso credentials not found. Using demo mode.");
  }
} catch (error) {
  console.error("❌ Turso connection error:", error);
}

export default client;

// Helper function: Generate unique ID
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function: Parse JSON safely
export function parseJSON<T>(jsonString: string | null, defaultValue: T): T {
  if (!jsonString) return defaultValue;
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return defaultValue;
  }
}

// Check if Turso is available
export function isTursoAvailable(): boolean {
  return client !== null;
}
