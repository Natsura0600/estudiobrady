const { readJson, writeJson } = require('../_lib/r2');
const { requireAdmin, isAdmin } = require('../_lib/auth');
const defaults = require('../_lib/defaults');
const ALLOWED = new Set(['noticias', 'servicios', 'indicadores']);
module.exports = async function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const type = req.query.type;
  if (!ALLOWED.has(type)) return res.status(404).json({ error: 'Contenido no encontrado.' });
  const key = `content/${type}.json`;
  try {
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', type === 'noticias' ? 'public, s-maxage=30, stale-while-revalidate=60' : 'public, s-maxage=300, stale-while-revalidate=600');
      let items = await readJson(key, defaults[type] || []);
      if (type === 'noticias' && !isAdmin(req)) items = items.filter(item => item.estado !== 'borrador' && item.estado !== 'archivado');
      return res.status(200).json(items);
    }
    if (req.method === 'PUT') {
      if (!requireAdmin(req, res)) return;
      res.setHeader('Cache-Control', 'no-store');
      const items = req.body;
      if (!Array.isArray(items) || items.length > 1000) return res.status(400).json({ error: 'El contenido debe ser una lista válida de hasta 1000 elementos.' });
      const serialized = JSON.stringify(items);
      if (Buffer.byteLength(serialized, 'utf8') > 2_000_000) return res.status(413).json({ error: 'El archivo JSON supera el límite de 2 MB.' });
      if (type === 'noticias') {
        for (const item of items) {
          if (!item || typeof item.titulo !== 'string' || !item.titulo.trim()) return res.status(400).json({ error: 'Cada noticia debe tener un título.' });
          if (!['publicado', 'borrador', 'archivado'].includes(item.estado || 'publicado')) item.estado = 'borrador';
        }
      }
      await writeJson(key, items);
      return res.status(200).json({ ok: true, count: items.length, saved: key });
    }
    res.setHeader('Allow', 'GET, PUT'); return res.status(405).json({ error: 'Método no permitido.' });
  } catch (error) {
    console.error('content api error:', error);
    return res.status(error.statusCode || 500).json({ error: error.statusCode === 503 ? error.message : 'No se pudo acceder al contenido. Revisá la configuración de R2 en Vercel.' });
  }
};
