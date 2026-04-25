import { Civilization, PeriodEvent, CellData } from "@/types";

// Use PostgreSQL API endpoint
const API_BASE_URL = "/api/postgres";

class DatabaseService {
  private async makeRequest(action: string, data?: any) {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, data }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Database operation failed');
      }

      return result.data;
    } catch (error) {
      console.warn(`Database ${action} failed:`, error);
      // Return null to indicate database is not available
      // The app will fall back to AsyncStorage
      return null;
    }
  }

  // Authentication
  async login(username: string, password: string) {
    return await this.makeRequest('login', { username, password });
  }

  async register(username: string, hashedPassword: string) {
    return await this.makeRequest('register', { username, password: hashedPassword });
  }

  // Civilizations
  async getCivilizations(): Promise<Civilization[]> {
    return await this.makeRequest('getCivilizations');
  }

  async saveCivilization(civilization: Civilization) {
    return await this.makeRequest('saveCivilization', civilization);
  }

  async deleteCivilization(id: string) {
    return await this.makeRequest('deleteCivilization', { id });
  }

  // Events
  async getEvents(): Promise<PeriodEvent[]> {
    return await this.makeRequest('getEvents');
  }

  async saveEvent(event: PeriodEvent) {
    return await this.makeRequest('saveEvent', event);
  }

  async deleteEvent(id: string) {
    return await this.makeRequest('deleteEvent', { id });
  }

  // Cell Data
  async getCellData(): Promise<CellData[]> {
    return await this.makeRequest('getCellData');
  }

  async saveCellData(cellData: CellData) {
    return await this.makeRequest('saveCellData', cellData);
  }

  // Photo upload (file-based, not base64!)
  async uploadPhoto(uri: string): Promise<string | null> {
    try {
      // Convert URI to blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Create FormData
      const formData = new FormData();
      formData.append('photo', blob, `photo-${Date.now()}.jpg`);
      
      // Upload to server
      const uploadResponse = await fetch('/api/upload-photo', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: HTTP ${uploadResponse.status}`);
      }
      
      const result = await uploadResponse.json();
      
      if (result.success && result.filename) {
        console.log('✅ Photo uploaded:', result.filename);
        return result.filename; // Return just the filename
      }
      
      throw new Error('Upload failed: No filename returned');
    } catch (error) {
      console.error('❌ Photo upload error:', error);
      return null;
    }
  }

  async deletePhoto(filename: string): Promise<boolean> {
    try {
      const response = await fetch('/api/delete-photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename }),
      });
      
      if (!response.ok) {
        throw new Error(`Delete failed: HTTP ${response.status}`);
      }
      
      const result = await response.json();
      return result.success === true;
    } catch (error) {
      console.error('❌ Photo delete error:', error);
      return false;
    }
  }

  // Bulk operations for initial data sync
  async syncCivilizations(civilizations: Civilization[]) {
    const promises = civilizations.map(civ => this.saveCivilization(civ));
    await Promise.all(promises);
  }

  async syncEvents(events: PeriodEvent[]) {
    const promises = events.map(event => this.saveEvent(event));
    await Promise.all(promises);
  }

  async syncCellData(cellData: CellData[]) {
    const promises = cellData.map(data => this.saveCellData(data));
    await Promise.all(promises);
  }
}

export const databaseService = new DatabaseService();