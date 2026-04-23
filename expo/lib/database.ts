import { Civilization, PeriodEvent, CellData } from "@/types";

const API_BASE_URL = "http://localhost:8084/api/mysql";

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