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
      await this.runMigrations();
      return this.db;
    } catch (error) {
      console.error('Error opening database: ', error);
      throw error;
    }
  }

  async runMigrations() {
    // add columns latitude/longitude if they don't exist
    await this.ensureColumnExists('journals', 'latitude', "REAL");
    await this.ensureColumnExists('journals', 'longitude', "REAL");
    // keep location stored in 'locationName' (your UI uses this). No rename needed.
    // ensure createdAt exists (for older dbs)
    await this.ensureColumnExists('journals', 'createdAt', "INTEGER DEFAULT (strftime('%s','now'))");
  }

  async ensureColumnExists(table, column, typeDDL) {
    const [res] = await this.db.executeSql(`PRAGMA table_info(${table});`);
    let exists = false;
    for (let i = 0; i < res.rows.length; i++) {
      if (res.rows.item(i).name === column) {
        exists = true;
        break;
      }
    }
    if (!exists) {
      console.log(`Adding column ${column} to ${table}`);
      await this.db.executeSql(`ALTER TABLE ${table} ADD COLUMN ${column} ${typeDDL};`);
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
          latitude REAL,
          longitude REAL,
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

      // Create tags table
      await this.db.executeSql(`
        CREATE TABLE IF NOT EXISTS journal_tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          journal_id TEXT NOT NULL,
          tag TEXT NOT NULL,
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

  // Generate tags from journal content (text-only baseline)
  generateTextTags(title, description) {
    const tags = [];
    const text = `${title || ''} ${description || ''}`.toLowerCase();

    const tagMap = {
      mountain: ['mountain', 'hill', 'peak', 'summit', 'hiking', 'trekking'],
      beach: ['beach', 'ocean', 'sea', 'coast', 'shore', 'sand'],
      food: ['food', 'restaurant', 'eat', 'meal', 'dinner', 'lunch', 'breakfast', 'cafe'],
      sunset: ['sunset', 'sunrise', 'dawn', 'dusk'],
      city: ['city', 'urban', 'downtown', 'metropolitan'],
      nature: ['nature', 'forest', 'park', 'wildlife', 'trees', 'garden'],
      adventure: ['adventure', 'explore', 'journey', 'trip', 'travel'],
      culture: ['culture', 'museum', 'art', 'history', 'heritage', 'monument'],
      family: ['family', 'kids', 'children', 'parents'],
      friends: ['friends', 'buddy', 'group'],
      relaxation: ['relax', 'spa', 'peaceful', 'calm', 'quiet'],
      festival: ['festival', 'celebration', 'event', 'party'],
      architecture: ['building', 'architecture', 'church', 'temple', 'palace'],
      shopping: ['shopping', 'market', 'store', 'bazaar'],
      sports: ['sports', 'game', 'football', 'basketball', 'swimming']
    };

    for (const [tag, keywords] of Object.entries(tagMap)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        tags.push(tag);
      }
    }

    if (tags.length === 0) tags.push('travel');
    return [...new Set(tags)];
  }

  // --- CRUD Operations for Journals ---

  // Add a new journal entry
  async addJournal(journal) {
    try {
      if (!this.db) {
        await this.initDB();
      }

      const {
        id,
        title,
        description,
        locationName,
        dateTime,
        productImage,      // array of { id?, url }
        latitude,
        longitude,
        tags               // optional array of strings (can be AI + text)
      } = journal;

      // Insert journal data
      await this.db.executeSql(
        `INSERT INTO journals (id, title, description, locationName, dateTime, latitude, longitude)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, title, description || '', locationName || '', dateTime || '', latitude ?? null, longitude ?? null]
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

      // Determine tags: if provided use them; otherwise generate from text
      const finalTags = (Array.isArray(tags) && tags.length > 0)
        ? [...new Set(tags.map(t => String(t).trim()).filter(Boolean))]
        : this.generateTextTags(title, description);

      // Insert tags
      for (const tag of finalTags) {
        await this.db.executeSql(
          `INSERT INTO journal_tags (journal_id, tag) VALUES (?, ?)`,
          [id, tag]
        );
      }

      console.log('Journal added successfully');
      return true;
    } catch (error) {
      console.error('Error adding journal: ', error);
      throw error;
    }
  }

  // Get all journals (including images + tags arrays)
  async getAllJournals() {
    try {
      if (!this.db) {
        await this.initDB();
      }

      const [journalResults] = await this.db.executeSql(
        'SELECT * FROM journals ORDER BY createdAt DESC'
      );

      const journals = [];

      for (let i = 0; i < journalResults.rows.length; i++) {
        const journal = journalResults.rows.item(i);

        const [imageResults] = await this.db.executeSql(
          'SELECT * FROM journal_images WHERE journal_id = ? ORDER BY image_order',
          [journal.id]
        );
        const productImage = [];
        for (let j = 0; j < imageResults.rows.length; j++) {
          const image = imageResults.rows.item(j);
          productImage.push({ id: image.id, url: image.image_url });
        }

        const [tagResults] = await this.db.executeSql(
          'SELECT tag FROM journal_tags WHERE journal_id = ?',
          [journal.id]
        );
        const tags = [];
        for (let t = 0; t < tagResults.rows.length; t++) {
          tags.push(tagResults.rows.item(t).tag);
        }

        journals.push({
          ...journal,
          productImage,
          tags
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

      const {
        id,
        title,
        description,
        locationName,
        dateTime,
        productImage,
        latitude,
        longitude,
        tags // optional override
      } = journal;

      await this.db.executeSql(
        `UPDATE journals 
         SET title = ?, description = ?, locationName = ?, dateTime = ?, latitude = ?, longitude = ?
         WHERE id = ?`,
        [title, description || '', locationName || '', dateTime || '', latitude ?? null, longitude ?? null, id]
      );

      // Replace images + tags
      await this.db.executeSql('DELETE FROM journal_images WHERE journal_id = ?', [id]);
      await this.db.executeSql('DELETE FROM journal_tags WHERE journal_id = ?', [id]);

      if (productImage && productImage.length > 0) {
        for (let i = 0; i < productImage.length; i++) {
          const image = productImage[i];
          await this.db.executeSql(
            `INSERT INTO journal_images (journal_id, image_url, image_order) VALUES (?, ?, ?)`,
            [id, image.url, i]
          );
        }
      }

      const finalTags = (Array.isArray(tags) && tags.length > 0)
        ? [...new Set(tags.map(t => String(t).trim()).filter(Boolean))]
        : this.generateTextTags(title, description);

      for (const tag of finalTags) {
        await this.db.executeSql(
          `INSERT INTO journal_tags (journal_id, tag) VALUES (?, ?)`,
          [id, tag]
        );
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
      await this.db.executeSql('DELETE FROM journals WHERE id = ?', [id]);
      console.log('Journal deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting journal: ', error);
      throw error;
    }
  }

  // Advanced search with multiple filters
  async advancedSearch(filters) {
    try {
      if (!this.db) {
        await this.initDB();
      }

      const { keyword, tags, startDate, endDate, locationRadius } = filters;

      let query = `
        SELECT DISTINCT j.* FROM journals j
        LEFT JOIN journal_tags jt ON j.id = jt.journal_id
        WHERE 1=1
      `;
      const params = [];

      if (keyword && keyword.trim()) {
        const searchPattern = `%${keyword.toLowerCase()}%`;
        query += ` AND (
          LOWER(j.title) LIKE ? 
          OR LOWER(j.description) LIKE ? 
          OR LOWER(j.locationName) LIKE ?
        )`;
        params.push(searchPattern, searchPattern, searchPattern);
      }

      if (tags && tags.length > 0) {
        const tagPlaceholders = tags.map(() => '?').join(',');
        query += ` AND jt.tag IN (${tagPlaceholders})`;
        params.push(...tags);
      }

      if (startDate) {
        query += ` AND date(j.dateTime) >= date(?)`;
        params.push(startDate);
      }

      if (endDate) {
        query += ` AND date(j.dateTime) <= date(?)`;
        params.push(endDate);
      }

      if (locationRadius && locationRadius.trim()) {
        query += ` AND LOWER(j.locationName) LIKE ?`;
        params.push(`%${locationRadius.toLowerCase()}%`);
      }

      query += ` ORDER BY j.createdAt DESC`;

      const [journalResults] = await this.db.executeSql(query, params);

      const journals = [];
      for (let i = 0; i < journalResults.rows.length; i++) {
        const journal = journalResults.rows.item(i);

        const [imageResults] = await this.db.executeSql(
          'SELECT * FROM journal_images WHERE journal_id = ? ORDER BY image_order',
          [journal.id]
        );

        const productImage = [];
        for (let j = 0; j < imageResults.rows.length; j++) {
          const image = imageResults.rows.item(j);
          productImage.push({ id: image.id, url: image.image_url });
        }

        const [tagResults] = await this.db.executeSql(
          'SELECT tag FROM journal_tags WHERE journal_id = ?',
          [journal.id]
        );
        const tagsArr = [];
        for (let t = 0; t < tagResults.rows.length; t++) {
          tagsArr.push(tagResults.rows.item(t).tag);
        }

        journals.push({
          ...journal,
          productImage,
          tags: tagsArr
        });
      }

      return journals;
    } catch (error) {
      console.error('Error in advanced search: ', error);
      throw error;
    }
  }

  // Simple search (for backward compatibility)
  async searchJournals(searchTerm) {
    return this.advancedSearch({ keyword: searchTerm });
  }

  // Get all unique tags
  async getAllTags() {
    try {
      if (!this.db) {
        await this.initDB();
      }
      const [results] = await this.db.executeSql(
        'SELECT DISTINCT tag FROM journal_tags ORDER BY tag'
      );
      const tags = [];
      for (let i = 0; i < results.rows.length; i++) {
        tags.push(results.rows.item(i).tag);
      }
      return tags;
    } catch (error) {
      console.error('Error getting tags: ', error);
      return [];
    }
  }

  // Get all unique locations
  async getAllLocations() {
    try {
      if (!this.db) {
        await this.initDB();
      }
      const [results] = await this.db.executeSql(
        `SELECT DISTINCT locationName FROM journals 
         WHERE locationName IS NOT NULL AND locationName != "" 
         ORDER BY locationName`
      );
      const locations = [];
      for (let i = 0; i < results.rows.length; i++) {
        locations.push(results.rows.item(i).locationName);
      }
      return locations;
    } catch (error) {
      console.error('Error getting locations: ', error);
      return [];
    }
  }

  // Get date range of journals
  async getDateRange() {
    try {
      if (!this.db) {
        await this.initDB();
      }
      const [results] = await this.db.executeSql(
        `SELECT 
          MIN(date(dateTime)) as minDate, 
          MAX(date(dateTime)) as maxDate 
         FROM journals 
         WHERE dateTime IS NOT NULL AND dateTime != ""`
      );
      if (results.rows.length > 0) {
        const row = results.rows.item(0);
        return { minDate: row.minDate, maxDate: row.maxDate };
      }
      return { minDate: null, maxDate: null };
    } catch (error) {
      console.error('Error getting date range: ', error);
      return { minDate: null, maxDate: null };
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

      const [tagCountResult] = await this.db.executeSql(
        'SELECT COUNT(DISTINCT tag) as uniqueTags FROM journal_tags'
      );

      return {
        totalJournals: countResult.rows.item(0).totalJournals,
        totalImages: imageCountResult.rows.item(0).totalImages,
        uniqueLocations: locationCountResult.rows.item(0).uniqueLocations,
        uniqueTags: tagCountResult.rows.item(0).uniqueTags
      };
    } catch (error) {
      console.error('Error getting stats: ', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export default new DatabaseService();
