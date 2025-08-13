// src/services/DatabaseService.js
import SQLite from 'react-native-sqlite-storage';

// Enable debugging (optional)
SQLite.DEBUG(true);
SQLite.enablePromise(true);

const database_name = 'TravelJournal.db';
const database_version = '1.0';
const database_displayname = 'Travel Journal SQLite Database';
const database_size = 200000;

class DatabaseService {
  constructor() {
    this.db = null;
  }

  // Initialize database connection
  async initDB() {
    try {
      this.db = await SQLite.openDatabase(
        database_name,
        database_version,
        database_displayname,
        database_size
      );
      console.log('Database opened successfully');
      await this.createTables();
      return this.db;
    } catch (error) {
      console.error('Error opening database: ', error);
      throw error;
    }
  }

  // Create tables
  async createTables() {
    try {
      // Create journals table
      await this.db.executeSql(`
        CREATE TABLE IF NOT EXISTS journals (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          description TEXT,
          locationName TEXT,
          dateTime TEXT,
          createdAt INTEGER DEFAULT (strftime('%s', 'now'))
        );
      `);

      // Create journal_images table for storing image paths
      await this.db.executeSql(`
        CREATE TABLE IF NOT EXISTS journal_images (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          journal_id TEXT NOT NULL,
          image_url TEXT NOT NULL,
          image_order INTEGER DEFAULT 0,
          FOREIGN KEY (journal_id) REFERENCES journals (id) ON DELETE CASCADE
        );
      `);

      console.log('Tables created successfully');
    } catch (error) {
      console.error('Error creating tables: ', error);
      throw error;
    }
  }

  // Close database connection
  async closeDB() {
    if (this.db) {
      try {
        await this.db.close();
        console.log('Database closed successfully');
        this.db = null;
      } catch (error) {
        console.error('Error closing database: ', error);
      }
    }
  }

  // CRUD Operations for Journals

  // Add a new journal entry
  async addJournal(journal) {
    try {
      if (!this.db) {
        await this.initDB();
      }

      const { id, title, description, locationName, dateTime, productImage } = journal;

      // Insert journal data
      await this.db.executeSql(
        `INSERT INTO journals (id, title, description, locationName, dateTime) 
         VALUES (?, ?, ?, ?, ?)`,
        [id, title, description || '', locationName || '', dateTime || '']
      );

      // Insert images if any
      if (productImage && productImage.length > 0) {
        for (let i = 0; i < productImage.length; i++) {
          const image = productImage[i];
          await this.db.executeSql(
            `INSERT INTO journal_images (journal_id, image_url, image_order) VALUES (?, ?, ?)`,
            [id, image.url, i]
          );
        }
      }

      console.log('Journal added successfully');
      return true;
    } catch (error) {
      console.error('Error adding journal: ', error);
      throw error;
    }
  }

  // Get all journals
  async getAllJournals() {
    try {
      if (!this.db) {
        await this.initDB();
      }

      // Get all journals
      const [journalResults] = await this.db.executeSql(
        'SELECT * FROM journals ORDER BY createdAt DESC'
      );

      const journals = [];
      
      for (let i = 0; i < journalResults.rows.length; i++) {
        const journal = journalResults.rows.item(i);
        
        // Get images for this journal
        const [imageResults] = await this.db.executeSql(
          'SELECT * FROM journal_images WHERE journal_id = ? ORDER BY image_order',
          [journal.id]
        );

        const productImage = [];
        for (let j = 0; j < imageResults.rows.length; j++) {
          const image = imageResults.rows.item(j);
          productImage.push({
            id: image.id,
            url: image.image_url
          });
        }

        journals.push({
          ...journal,
          productImage
        });
      }

      return journals;
    } catch (error) {
      console.error('Error getting journals: ', error);
      throw error;
    }
  }

  // Update a journal entry
  async updateJournal(journal) {
    try {
      if (!this.db) {
        await this.initDB();
      }

      const { id, title, description, locationName, dateTime, productImage } = journal;

      // Update journal data
      await this.db.executeSql(
        `UPDATE journals 
         SET title = ?, description = ?, locationName = ?, dateTime = ? 
         WHERE id = ?`,
        [title, description || '', locationName || '', dateTime || '', id]
      );

      // Delete existing images
      await this.db.executeSql(
        'DELETE FROM journal_images WHERE journal_id = ?',
        [id]
      );

      // Insert new images
      if (productImage && productImage.length > 0) {
        for (let i = 0; i < productImage.length; i++) {
          const image = productImage[i];
          await this.db.executeSql(
            `INSERT INTO journal_images (journal_id, image_url, image_order) VALUES (?, ?, ?)`,
            [id, image.url, i]
          );
        }
      }

      console.log('Journal updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating journal: ', error);
      throw error;
    }
  }

  // Delete a journal entry
  async deleteJournal(id) {
    try {
      if (!this.db) {
        await this.initDB();
      }

      // Delete journal (images will be deleted automatically due to CASCADE)
      await this.db.executeSql('DELETE FROM journals WHERE id = ?', [id]);

      console.log('Journal deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting journal: ', error);
      throw error;
    }
  }

  // Search journals
  async searchJournals(searchTerm) {
    try {
      if (!this.db) {
        await this.initDB();
      }

      const searchPattern = `%${searchTerm.toLowerCase()}%`;
      
      const [journalResults] = await this.db.executeSql(
        `SELECT * FROM journals 
         WHERE LOWER(title) LIKE ? 
         OR LOWER(description) LIKE ? 
         OR LOWER(locationName) LIKE ?
         ORDER BY createdAt DESC`,
        [searchPattern, searchPattern, searchPattern]
      );

      const journals = [];
      
      for (let i = 0; i < journalResults.rows.length; i++) {
        const journal = journalResults.rows.item(i);
        
        // Get images for this journal
        const [imageResults] = await this.db.executeSql(
          'SELECT * FROM journal_images WHERE journal_id = ? ORDER BY image_order',
          [journal.id]
        );

        const productImage = [];
        for (let j = 0; j < imageResults.rows.length; j++) {
          const image = imageResults.rows.item(j);
          productImage.push({
            id: image.id,
            url: image.image_url
          });
        }

        journals.push({
          ...journal,
          productImage
        });
      }

      return journals;
    } catch (error) {
      console.error('Error searching journals: ', error);
      throw error;
    }
  }

  // Get journal statistics
  async getJournalStats() {
    try {
      if (!this.db) {
        await this.initDB();
      }

      const [countResult] = await this.db.executeSql(
        'SELECT COUNT(*) as totalJournals FROM journals'
      );

      const [imageCountResult] = await this.db.executeSql(
        'SELECT COUNT(*) as totalImages FROM journal_images'
      );

      const [locationCountResult] = await this.db.executeSql(
        'SELECT COUNT(DISTINCT locationName) as uniqueLocations FROM journals WHERE locationName IS NOT NULL AND locationName != ""'
      );

      return {
        totalJournals: countResult.rows.item(0).totalJournals,
        totalImages: imageCountResult.rows.item(0).totalImages,
        uniqueLocations: locationCountResult.rows.item(0).uniqueLocations
      };
    } catch (error) {
      console.error('Error getting stats: ', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export default new DatabaseService();