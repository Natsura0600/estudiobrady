const crypto = require('crypto');
const { createUploadUrl } = require('./_lib/r2');
const { requireAdmin } = require('./_lib/auth');
const MIME_EXT = { 'image/jpeg':'jpg', 'image/png':'png', 'image/webp':'webp', 'image/gif':'gif', 'image/avif':'avif' };
module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido.' });
  if (!requireAdmin(req, res)) return;
  const { contentType, size } = req.body || {};
  if (!MIME_EXT[contentType]) return res.status(400).json({ error: 'Formato no permitido. Usá JPG, PNG, WEBP, GIF o AVIF.' });
  if (!Number.isFinite(Number(size)) || Number(size) < 1 || Number(size) > 8 * 1024 * 1024) return res.status(400).json({ error: 'La imagen debe pesar hasta 8 MB.' });
  if (!process.env.R2_PUBLIC_URL) return res.status(503).json({ error: 'Falta configurar R2_PUBLIC_URL con el dominio público de las imágenes.' });
  try {
    const key = `images/${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}.${MIME_EXT[contentType]}`;
    const uploadUrl = await createUploadUrl(key, contentType);
    const publicUrl = `${process.env.R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`;
    return res.status(200).json({ uploadUrl, publicUrl, key, contentType });
  } catch (error) {
    console.error('upload url error:', error);
    return res.status(error.statusCode || 500).json({ error: error.statusCode === 503 ? error.message : 'No se pudo preparar la subida a R2.' });
  }
};
