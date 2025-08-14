import { supabase } from './supabaseClient';
import DatabaseService from './DatabaseService';

export async function syncUnsyncedJournals() {
  try {
    // Initialize DB if needed
    if (!DatabaseService.db) {
      await DatabaseService.initDB();
    }

    // First, add synced column if it doesn't exist
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
        tags
      });
    }

    console.log(`📤 Syncing ${journals.length} journals to Supabase...`);

    // 2️⃣ Insert journals into Supabase 
    const { error: journalError } = await supabase.from('journal').insert(
      journals.map(j => ({
        id: j.id,
        title: j.title,
        description: j.description,     // Map locationName -> location
        tags: j.tags,                    // Send as array
        // created_at: new Date(j.createdAt * 1000).toISOString(), // Convert Unix timestamp to ISO
        date_time: j.dateTime,
        latitude: j.latitude,
        longitude: j.longitude
      }))
    );

    if (journalError) {
      console.error('Supabase journal insert error:', journalError);
      throw journalError;
    }

    // 3️⃣ Insert related images
    for (let journal of journals) {
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