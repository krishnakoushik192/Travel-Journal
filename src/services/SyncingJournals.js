import { supabase } from './supabaseClient';
import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);
const db = SQLite.openDatabase({ name: 'journals.db', location: 'default' });

export async function syncUnsyncedJournals() {
  try {
    const database = await db;

    // 1️⃣ Get all journals not yet synced
    const journals = await new Promise((resolve, reject) => {
      database.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM journals WHERE synced = 0`,
          [],
          (_, results) => {
            const rows = [];
            for (let i = 0; i < results.rows.length; i++) {
              rows.push(results.rows.item(i));
            }
            resolve(rows);
          },
          (_, err) => reject(err)
        );
      });
    });

    if (!journals.length) {
      console.log("✅ No unsynced journals found");
      return;
    }

    console.log(`📤 Syncing ${journals.length} journals to Supabase...`);

    // 2️⃣ Insert journals into Supabase
    const { error: journalError } = await supabase.from('journals').insert(
      journals.map(j => ({
        id: j.id,
        title: j.title,
        description: j.description,
        location: j.location,
        tags: JSON.parse(j.tags || "[]"),
        created_at: j.created_at,
      }))
    );
    if (journalError) throw journalError;

    // 3️⃣ Insert related images
    for (let j of journals) {
      const images = await new Promise((resolve, reject) => {
        database.transaction(tx => {
          tx.executeSql(
            `SELECT * FROM journal_images WHERE journal_id = ?`,
            [j.id],
            (_, results) => {
              const imgRows = [];
              for (let i = 0; i < results.rows.length; i++) {
                imgRows.push(results.rows.item(i));
              }
              resolve(imgRows);
            },
            (_, err) => reject(err)
          );
        });
      });

      if (images.length) {
        const { error: imgError } = await supabase.from('journal_images').insert(
          images.map((img, idx) => ({
            journal_id: j.id,
            image_url: img.image_url,
            image_order: idx,
          }))
        );
        if (imgError) throw imgError;
      }
    }

    // 4️⃣ Mark journals as synced in local DB
    database.transaction(tx => {
      tx.executeSql(
        `UPDATE journals SET synced = 1 WHERE id IN (${journals.map(j => `'${j.id}'`).join(",")})`
      );
    });

    console.log("✅ Sync completed");
  } catch (err) {
    console.error("❌ Sync failed:", err);
  }
}
