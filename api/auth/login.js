const { safeEqual, sign, setCookie, originOk, MAX_AGE } = require('../_lib/auth');
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido.' });
  if (!originOk(req)) return res.status(403).json({ error: 'Origen no permitido.' });
  const { ADMIN_PASSWORD, SESSION_SECRET, ADMIN_USERNAME = 'admin' } = process.env;
  if (!ADMIN_PASSWORD || !SESSION_SECRET || SESSION_SECRET.length < 32) return res.status(503).json({ error: 'Falta configurar ADMIN_PASSWORD y SESSION_SECRET (mínimo 32 caracteres).' });
  const body = req.body || {};
  if (!safeEqual(body.username || '', ADMIN_USERNAME) || !safeEqual(body.password || '', ADMIN_PASSWORD)) return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
  const token = sign({ role: 'admin', exp: Math.floor(Date.now()/1000) + MAX_AGE });
  setCookie(res, token);
  return res.status(200).json({ ok: true, username: ADMIN_USERNAME });
};
