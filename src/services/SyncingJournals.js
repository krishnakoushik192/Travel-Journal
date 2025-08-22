import { supabase } from './supabaseClient';
import DatabaseService from './DatabaseService';

export async function syncUnsyncedJournals() {
  try {
    // Initialize DB if needed
    if (!DatabaseService.db) {
      await DatabaseService.initDB();
    }

    // First, add synced column if it doesn't exist (handled by runMigrations now)
    await DatabaseService.ensureColumnExists('journals', 'synced', 'INTEGER DEFAULT 0');

    // 1️⃣ Get all journals not yet synced
    const [results] = await DatabaseService.db.executeSql(
      `SELECT * FROM journals WHERE synced = 0 OR synced IS NULL`
    );

    if (results.rows.length === 0) {
      console.log("✅ No unsynced journals found");
      return;
    }

    const journals = [];
    for (let i = 0; i < results.rows.length; i++) {
      const journal = results.rows.item(i);

      // Get tags for this journal
      const [tagResults] = await DatabaseService.db.executeSql(
        'SELECT tag FROM journal_tags WHERE journal_id = ?',
        [journal.id]
      );

      const tags = [];
      for (let t = 0; t < tagResults.rows.length; t++) {
        tags.push(tagResults.rows.item(t).tag);
      }

      journals.push({
        ...journal,
        tags: tags || [] // Ensure tags is always an array, never undefined
      });
    }

    console.log(`📤 Syncing ${journals.length} journals to Supabase...`);
    
    // Debug: Log first journal to see its structure
    if (journals.length > 0) {
      console.log("Sample journal data:", JSON.stringify(journals[0], null, 2));
    }

    // 2️⃣ Handle both inserts and updates using upsert
    const journalData = journals.map(j => {
      const data = {
        id: j.id,
        title: j.title || '',
        description: j.description || '',
        tags: Array.isArray(j.tags) ? j.tags : [], // Ensure tags is always an array
        date_time: j.dateTime || null,
        latitude: j.latitude || null,
        longitude: j.longitude || null
      };
      
      // Debug log each journal being synced
      console.log(`Syncing journal ${j.id}:`, data);
      return data;
    });

    const { error: journalError } = await supabase.from('journal').upsert(
      journalData,
      {
        onConflict: 'id' // Use 'id' as the conflict resolution column
      }
    );

    if (journalError) {
      console.error('Supabase journal upsert error:', journalError);
      throw journalError;
    }

    // 3️⃣ Handle images - delete and re-insert for updated journals
    for (let journal of journals) {
      // First, delete existing images for this journal in Supabase
      const { error: deleteImgError } = await supabase
        .from('journal_images')
        .delete()
        .eq('journal_id', journal.id);

      if (deleteImgError) {
        console.error('Error deleting existing images:', deleteImgError);
        // Don't throw here, continue with insertion
      }

      // Then insert current images
      const [imageResults] = await DatabaseService.db.executeSql(
        `SELECT * FROM journal_images WHERE journal_id = ? ORDER BY image_order`,
        [journal.id]
      );

      if (imageResults.rows.length > 0) {
        const images = [];
        for (let i = 0; i < imageResults.rows.length; i++) {
          const img = imageResults.rows.item(i);
          images.push({
            journal_id: journal.id,
            image_url: img.image_url,
            image_order: img.image_order
          });
        }

        const { error: imgError } = await supabase.from('journal_images').insert(images);
        if (imgError) {
          console.error('Supabase image insert error:', imgError);
          throw imgError;
        }
      }
    }

    // 4️⃣ Mark journals as synced in local DB
    const journalIds = journals.map(j => j.id);
    const placeholders = journalIds.map(() => '?').join(',');

    await DatabaseService.db.executeSql(
      `UPDATE journals SET synced = 1 WHERE id IN (${placeholders})`,
      journalIds
    );

    console.log("✅ Sync completed successfully");
    return { success: true, syncedCount: journals.length };

  } catch (err) {
    console.error("❌ Sync failed:", err);
    throw err;
  }
}

// Optional: Function to reset sync status (for testing)
export async function resetSyncStatus() {
  try {
    if (!DatabaseService.db) {
      await DatabaseService.initDB();
    }

    await DatabaseService.db.executeSql(
      `UPDATE journals SET synced = 0 WHERE synced = 1`
    );

    console.log("🔄 Sync status reset - all journals marked as unsynced");
  } catch (err) {
    console.error("❌ Reset sync status failed:", err);
  }
}

// Function to check if there are unsynced journals
export async function hasUnsyncedJournals() {
  try {
    if (!DatabaseService.db) {
      await DatabaseService.initDB();
    }

    const [results] = await DatabaseService.db.executeSql(
      `SELECT COUNT(*) as count FROM journals WHERE synced = 0 OR synced IS NULL`
    );

    return results.rows.item(0).count > 0;
  } catch (err) {
    console.error("❌ Error checking unsynced journals:", err);
    return false;
  }
}