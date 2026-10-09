const { isAdmin } = require('../_lib/auth');
module.exports = function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido.' });
  return res.status(200).json({ authenticated: isAdmin(req) });
};
