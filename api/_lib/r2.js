const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

function client() {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY } = process.env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    const err = new Error('Falta configurar las credenciales de Cloudflare R2 en Vercel.');
    err.statusCode = 503;
    throw err;
  }
  return new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY }
  });
}
function bucket() {
  if (!process.env.R2_BUCKET_NAME) {
    const err = new Error('Falta configurar R2_BUCKET_NAME en Vercel.');
    err.statusCode = 503;
    throw err;
  }
  return process.env.R2_BUCKET_NAME;
}
async function readJson(key, fallback) {
  const s3 = client();
  try {
    const result = await s3.send(new GetObjectCommand({ Bucket: bucket(), Key: key }));
    const text = await result.Body.transformToString();
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed)) throw new Error('El JSON almacenado no contiene una lista.');
    return parsed;
  } catch (error) {
    if (error.name === 'NoSuchKey' || error.Code === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) return fallback;
    throw error;
  }
}
async function writeJson(key, value) {
  const s3 = client();
  await s3.send(new PutObjectCommand({
    Bucket: bucket(), Key: key, Body: JSON.stringify(value, null, 2),
    ContentType: 'application/json; charset=utf-8', CacheControl: 'no-store'
  }));
}
async function createUploadUrl(key, contentType) {
  const s3 = client();
  return getSignedUrl(s3, new PutObjectCommand({ Bucket: bucket(), Key: key, ContentType: contentType }), { expiresIn: 300 });
}
module.exports = { readJson, writeJson, createUploadUrl };
