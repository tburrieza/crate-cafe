// POST /api/signup: alta en Crate Puntos (nombre, apellido, email + consentimiento).
// No se guarda la IP ni datos de navegación. El consentimiento queda con versión y fecha.

const { getDb } = require('../lib/mongo');

const TERMS_VERSION = '2026-11-01';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX = { nombre: 60, apellido: 60, email: 120 };

let indexReady = false;

async function ensureIndex(db) {
  if (indexReady) return;
  await db.collection('signups').createIndex({ email: 1 }, { unique: true });
  indexReady = true;
}

function clean(v, max) {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Método no permitido' });

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ ok: false, error: 'Datos inválidos' });
    }
  }
  body = body || {};

  // Campo trampa: los bots lo completan, las personas no lo ven.
  if (body.website) return res.status(200).json({ ok: true });

  const nombre = clean(body.nombre, MAX.nombre);
  const apellido = clean(body.apellido, MAX.apellido);
  const email = clean(body.email, MAX.email).toLowerCase();

  if (!nombre || !apellido) return res.status(400).json({ ok: false, error: 'Completá nombre y apellido.' });
  if (!EMAIL.test(email)) return res.status(400).json({ ok: false, error: 'El email no es válido.' });
  if (body.consent !== true) return res.status(400).json({ ok: false, error: 'Tenés que aceptar los términos para registrarte.' });

  try {
    const db = await getDb();
    await ensureIndex(db);
    const now = new Date();
    // Solo altas nuevas: un email ya registrado no se modifica desde la web.
    // Misma respuesta exista o no el email, así no se puede averiguar qué emails están registrados.
    try {
      await db.collection('signups').insertOne({
        email,
        nombre,
        apellido,
        createdAt: now,
        source: 'web',
        consent: { terms: TERMS_VERSION, at: now, privacy: true, transferUK: true },
      });
    } catch (err) {
      if (err.code !== 11000) throw err;
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('signup:', err.message);
    return res.status(503).json({ ok: false, error: 'No pudimos registrarte ahora. Probá de nuevo en unos minutos.' });
  }
};
