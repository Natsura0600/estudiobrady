# Estudio Brady — versión clásica con publicación automática

Sitio estático en Vercel, contenido en JSON dentro de un único bucket Cloudflare R2 y portadas/imágenes en ese mismo bucket. La publicación la realiza una Vercel Function; no utiliza Cloudflare Workers ni D1.

## Arquitectura
- Vercel sirve HTML/CSS/JS y ejecuta las funciones `/api/*`.
- Cloudflare R2 guarda `content/noticias.json`, `content/servicios.json`, `content/indicadores.json` y `images/...`.
- El panel usa una sesión firmada en cookie `HttpOnly`, `Secure`, `SameSite=Strict`.
- El navegador nunca recibe las credenciales de R2. Las imágenes se suben con URL prefirmada de cinco minutos.

## Requisitos de despliegue
Este proyecto incluye funciones backend. Debe desplegarse como proyecto Vercel completo desde GitHub o mediante la CLI de Vercel; no sirve un alojamiento puramente estático ni una subida que ignore la carpeta `api/`.

1. Subí todos los archivos de esta carpeta a un repositorio GitHub.
2. En Vercel, importá ese repositorio como proyecto. No elijas un framework; dejá el directorio raíz en `./`.
3. Vercel detectará `api/*.js` como Node.js Functions e instalará `package.json`.
4. En Cloudflare, creá un único bucket R2, por ejemplo `estudio-brady-media`.
5. En R2, generá credenciales S3 con permiso Object Read & Write limitado solo a ese bucket. Copiá el Account ID, Access Key ID y Secret Access Key.
6. Para mostrar imágenes, activá acceso público para el bucket mediante un dominio personalizado recomendado. Guardá el dominio base, sin barra final, como `R2_PUBLIC_URL`. El bucket contendrá también JSON de contenido público; no guardes información privada en él.
7. Configurá CORS del bucket para permitir `PUT` desde el dominio de producción de Vercel (y el dominio preview solo si lo necesitás), con encabezado `Content-Type`. No uses `*` en producción.
8. En Vercel → Project → Settings → Environment Variables, agregá estas variables para Production:
   - `R2_ACCOUNT_ID`: Account ID de Cloudflare.
   - `R2_ACCESS_KEY_ID`: Access Key ID de R2.
   - `R2_SECRET_ACCESS_KEY`: Secret Access Key de R2.
   - `R2_BUCKET_NAME`: nombre exacto del bucket.
   - `R2_PUBLIC_URL`: URL pública base del bucket (ej. `https://media.tudominio.com`).
   - `ADMIN_USERNAME`: usuario de administración (ej. `admin`).
   - `ADMIN_PASSWORD`: contraseña larga, única y aleatoria.
   - `SESSION_SECRET`: secreto aleatorio de al menos 32 caracteres; idealmente 48–64 caracteres aleatorios.
9. Volvé a desplegar (Redeploy) para que las funciones reciban las variables.
10. Abrí `/pages/admin.html`, iniciá sesión y guardá un artículo. La primera escritura crea el JSON correspondiente en `content/` dentro de R2. Los datos de ejemplo del ZIP sirven como valores iniciales si ese objeto aún no existe.

## CORS de R2
En el panel de R2 → bucket → Settings → CORS, configurá una regla equivalente a:
```json
[
  {
    "AllowedOrigins": ["https://TU-PROYECTO.vercel.app"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```
Reemplazá el dominio por el real. Si también usás un dominio propio, agregalo como otro origen exacto.

## Rutas API
- `GET /api/auth/session`: estado de sesión.
- `POST /api/auth/login`: inicia sesión.
- `POST /api/auth/logout`: cierra sesión.
- `GET /api/content/noticias|servicios|indicadores`: lectura pública.
- `PUT /api/content/noticias|servicios|indicadores`: guardar contenido, requiere sesión de administrador.
- `POST /api/upload`: genera URL prefirmada para imagen, requiere sesión.

## Seguridad y operación
- No compartas ni publiques las variables de entorno ni el archivo de credenciales R2.
- El bucket público sirve imágenes y, técnicamente, permite acceder a objetos JSON si alguien conoce su ruta. Los JSON solo deben contener contenido destinado al público.
- La sesión vence a las 8 horas. Para más usuarios, recuperación de contraseña, límites de intentos distribuidos y auditoría, se recomienda agregar un proveedor de identidad.
- La caché pública de contenido se configura en 30 segundos para noticias y 5 minutos para servicios/indicadores. Una publicación puede tardar ese tiempo en reflejarse en todas las ubicaciones.
- No subir datos personales de clientes al CMS. El sistema está diseñado para artículos públicos, servicios e indicadores.
- Los indicadores incluidos son demostrativos, no cotizaciones en tiempo real.

## Desarrollo local
Las funciones `/api` requieren entorno Node.js y las variables anteriores. En un proyecto ya importado a Vercel, podés usar `vercel dev` si tenés la CLI instalada. Para quien no usa programas locales, editá en GitHub y dejá que Vercel despliegue automáticamente cada commit.
