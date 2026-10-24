import dns from 'dns';
import mongoose from 'mongoose';

// Fix for Node DNS SRV lookups on Windows
if (dns && typeof dns.setServers === 'function') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (_e) {}
}

const LOCAL_URI = 'mongodb://127.0.0.1:27017/campuscare';
const ATLAS_URI = 'mongodb+srv://pavandurgapavan828_db_user:D0ht2zRMEI9Pq5K0@cluster0.dakxi19.mongodb.net/campuscare?retryWrites=true&w=majority&compressors=zlib';

async function migrate() {
  console.log('Connecting to Local MongoDB...');
  const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
  console.log('Connected to Local MongoDB: ' + localConn.name);

  console.log('Connecting to MongoDB Atlas...');
  const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
  console.log('Connected to MongoDB Atlas: ' + atlasConn.name);

  const collections = await localConn.db.listCollections().toArray();
  console.log(`\nFound ${collections.length} collections to transfer.\n`);

  for (const { name } of collections) {
    if (name.startsWith('system.')) continue;

    const localCol = localConn.db.collection(name);
    const atlasCol = atlasConn.db.collection(name);

    const docs = await localCol.find({}).toArray();
    console.log(`Migrating '${name}' (${docs.length} documents)...`);

    // Clear destination collection first
    await atlasCol.deleteMany({});

    if (docs.length > 0) {
      await atlasCol.insertMany(docs);
      console.log(` -> Transferred ${docs.length} documents into Atlas '${name}'`);
    } else {
      console.log(` -> 0 documents (empty collection), skipped insertion.`);
    }

    // Copy indexes
    try {
      const indexes = await localCol.indexes();
      for (const idx of indexes) {
        if (idx.name === '_id_') continue;
        const keys = idx.key;
        delete idx.key;
        delete idx.v;
        delete idx.ns;
        await atlasCol.createIndex(keys, idx);
      }
    } catch (err) {
      console.warn(`  Warning copying indexes for ${name}:`, err.message);
    }
  }

  console.log('\n--- VERIFYING ATLAS DATA ---');
  const atlasCols = await atlasConn.db.listCollections().toArray();
  for (const { name } of atlasCols) {
    const count = await atlasConn.db.collection(name).countDocuments();
    console.log(`Atlas [${name}]: ${count} documents`);
  }

  await localConn.close();
  await atlasConn.close();
  console.log('\nAll collections successfully migrated to MongoDB Atlas!');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
