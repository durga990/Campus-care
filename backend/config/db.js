import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import dns from 'dns';

// Ensure SRV records can resolve reliably across OS and cloud environments
if (dns && typeof dns.setServers === 'function') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (_e) {
    // Keep system default if restricted
  }
}

let memoryServer = null;

export async function connectDB() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not set. Copy .env.example to .env and fill it in.');
  mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'));

  const isLocal = process.env.MONGO_URI.includes('127.0.0.1') || process.env.MONGO_URI.includes('localhost');
  const timeout = isLocal ? 2000 : 8000;

  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: timeout });
    console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    if (process.env.NODE_ENV !== 'production' && isLocal) {
      console.log(`Local MongoDB not running on 27017. Starting embedded MongoDB engine...`);
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const dbPath = path.resolve('./data/db');
      if (!fs.existsSync(dbPath)) {
        fs.mkdirSync(dbPath, { recursive: true });
      }
      memoryServer = await MongoMemoryServer.create({
        instance: {
          port: 27017,
          dbName: 'campuscare',
          dbPath,
          storageEngine: 'wiredTiger'
        }
      });
      const uri = memoryServer.getUri('campuscare');
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log(`Embedded MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name} (persistent at ./data/db)`);
    } else {
      throw err;
    }
  }
}

export async function closeDB() {
  await mongoose.connection.close();
  if (memoryServer) {
    await memoryServer.stop();
  }
}
