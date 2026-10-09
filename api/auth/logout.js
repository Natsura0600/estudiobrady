const { clearCookie, originOk } = require('../_lib/auth');
module.exports = function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido.' });
  if (!originOk(req)) return res.status(403).json({ error: 'Origen no permitido.' });
  clearCookie(res); return res.status(200).json({ ok: true });
};
