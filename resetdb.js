// One-time script to reset the database
import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function resetDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Drop all tables
    console.log('Dropping tables...');
    await client.query(`
      DROP TABLE IF EXISTS translation_requests CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS accounts CASCADE;
      DROP TABLE IF EXISTS sessions CASCADE;
    `);

    console.log('All tables dropped successfully');
  } catch (err) {
    console.error('Error resetting database:', err);
  } finally {
    await client.end();
  }
}

resetDatabase();