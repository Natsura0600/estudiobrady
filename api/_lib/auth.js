const crypto = require('crypto');
const COOKIE = 'brady_admin_session';
const MAX_AGE = 8 * 60 * 60;
function safeEqual(a, b) {
  const aa = Buffer.from(String(a)); const bb = Buffer.from(String(b));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}
function originOk(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try { return new URL(origin).host === req.headers.host; } catch { return false; }
}
function sign(payload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', process.env.SESSION_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}
function verify(token) {
  if (!token || !process.env.SESSION_SECRET) return false;
  const parts = token.split('.'); if (parts.length !== 2) return false;
  const expected = crypto.createHmac('sha256', process.env.SESSION_SECRET).update(parts[0]).digest('base64url');
  if (!safeEqual(expected, parts[1])) return false;
  try { const data = JSON.parse(Buffer.from(parts[0], 'base64url').toString()); return data.exp > Math.floor(Date.now()/1000) && data.role === 'admin'; } catch { return false; }
}
function cookieToken(req) {
  const cookie = req.headers.cookie || '';
  const part = cookie.split(';').map(v => v.trim()).find(v => v.startsWith(`${COOKIE}=`));
  return part ? decodeURIComponent(part.slice(COOKIE.length + 1)) : '';
}
function isAdmin(req) { return verify(cookieToken(req)); }
function setCookie(res, token) {
  res.setHeader('Set-Cookie', `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${MAX_AGE}`);
}
function clearCookie(res) { res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`); }
function requireAdmin(req, res) {
  if (!originOk(req)) { res.status(403).json({ error: 'Origen no permitido.' }); return false; }
  if (!isAdmin(req)) { res.status(401).json({ error: 'Iniciá sesión para continuar.' }); return false; }
  return true;
}
module.exports = { safeEqual, sign, isAdmin, setCookie, clearCookie, requireAdmin, originOk, MAX_AGE };
