// Conexión a MongoDB reutilizada entre invocaciones de la función serverless.
// La URI está en Vercel (Project Settings > Environment Variables) como `cratepuntos_MONGODB_URI`; nunca en el repo.

const { MongoClient } = require('mongodb');

const cache = globalThis.__crateMongo || (globalThis.__crateMongo = { promise: null });

function getDb() {
  const uri = process.env.cratepuntos_MONGODB_URI || process.env.MONGODB_URI;
  if (!uri) throw new Error('Falta cratepuntos_MONGODB_URI');
  if (!cache.promise) {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000, maxPoolSize: 5 });
    cache.promise = client
      .connect()
      .then(c => c.db(process.env.MONGO_DB || 'crate_puntos'))
      .catch(err => {
        cache.promise = null;
        throw err;
      });
  }
  return cache.promise;
}

module.exports = { getDb };
