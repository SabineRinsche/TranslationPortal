// Script to update the database schema for the translation requests table
import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function updateSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Add the character_count column and rename char_count if it exists
    console.log('Updating translation_requests table schema...');
    
    // First check if character_count column already exists
    const checkColumnResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'translation_requests' 
      AND column_name = 'character_count';
    `);
    
    if (checkColumnResult.rows.length === 0) {
      // Check if char_count exists first
      const checkOldColumnResult = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'translation_requests' 
        AND column_name = 'char_count';
      `);
      
      if (checkOldColumnResult.rows.length > 0) {
        // Rename char_count to character_count
        await client.query(`
          ALTER TABLE translation_requests
          RENAME COLUMN char_count TO character_count;
        `);
        console.log('Renamed char_count column to character_count');
      } else {
        // Add character_count column if neither column exists
        await client.query(`
          ALTER TABLE translation_requests
          ADD COLUMN character_count INTEGER NOT NULL DEFAULT 0;
        `);
        console.log('Added character_count column');
      }
    } else {
      console.log('character_count column already exists');
    }

    // Update the project_updates table schema to include updateType changes
    console.log('Updating project_updates table schema...');
    
    // Check if update_type column exists
    const checkUpdateTypeResult = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'project_updates' 
      AND column_name = 'update_type';
    `);
    
    if (checkUpdateTypeResult.rows.length > 0) {
      // Add the enum constraint check if needed
      await client.query(`
        ALTER TABLE project_updates
        DROP CONSTRAINT IF EXISTS valid_update_type;
        
        ALTER TABLE project_updates
        ADD CONSTRAINT valid_update_type
        CHECK (update_type IN ('note', 'status_change', 'milestone', 'issue'));
      `);
      console.log('Updated update_type constraints');
    }

    console.log('Database schema updated successfully');
  } catch (err) {
    console.error('Error updating database schema:', err);
  } finally {
    await client.end();
  }
}

updateSchema();