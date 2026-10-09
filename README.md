# Estudio Brady — sitio web

Sitio estático multipágina para Estudio Brady, con una identidad visual clásica y sobria: tipografía serif para títulos, sans serif legible para textos, paleta verde institucional y detalles discretos en dorado.

## Publicación

El sitio no requiere un proceso de compilación. Subí la carpeta completa del proyecto a Vercel. `index.html` debe quedar en la raíz, junto a las carpetas `pages`, `css`, `js`, `data` y `assets`.

## Secciones

- Inicio, noticias y artículos individuales.
- Servicios y presentación del estudio.
- Indicadores de demostración (no son datos oficiales en tiempo real).
- Calculadoras de interés compuesto, IVA, aumentos, descuentos, inflación acumulada y rentabilidad.
- Formulario de contacto que prepara un correo mediante la aplicación de correo del visitante.
- Panel local para editar, importar y exportar contenido JSON.

## Antes de publicar

1. Revisá el correo destinatario configurado en `js/app.js` dentro de `initContact()` y reemplazalo por el correo real del estudio.
2. Revisá los textos y datos de contacto, y completá la información institucional que corresponda.
3. Los artículos de ejemplo deben ser revisados y ampliados por el estudio antes de presentarse como asesoramiento profesional.
4. Los indicadores son demostrativos; no los presentes como valores actuales.

## Limitaciones importantes

El panel de administración es una herramienta local de edición: guarda los cambios en el `localStorage` del navegador donde se usa. No tiene autenticación y no publica los cambios para otros visitantes. Para una administración profesional compartida hay que integrar autenticación y un CMS o una base de datos. No cargues información confidencial en el panel actual.

El formulario abre la aplicación de correo del usuario; no envía automáticamente los mensajes a un servidor. Para recepción automática se requiere un servicio de formularios o un backend.
