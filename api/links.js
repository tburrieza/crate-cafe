// GET /api/links: enlaces del linktree desde la colección `links`.
// Cache en el edge de Vercel de 5 min (s-maxage); durante 10 min más se sirve lo viejo mientras se revalida.
// Si Mongo no responde se devuelven los enlaces por defecto y no se cachea el error.

const { getDb } = require('../lib/mongo');

const DEFAULT_LINKS = [
  { label: 'Instagram', url: 'https://www.instagram.com/elcafedecrate/' },
  { label: 'Crate Puntos', url: '/crate-puntos' },
];

const isSafeUrl = url => /^(https?:\/\/|\/(?!\/))[^\s]+$/.test(url);

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const db = await getDb();
    const docs = await db
      .collection('links')
      .find({ active: true })
      .sort({ order: 1 })
      .project({ _id: 0, label: 1, url: 1 })
      .toArray();
    const links = docs.filter(l => typeof l.label === 'string' && isSafeUrl(l.url || ''));
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ links: links.length ? links : DEFAULT_LINKS });
  } catch (err) {
    console.error('links:', err.message);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ links: DEFAULT_LINKS });
  }
};
