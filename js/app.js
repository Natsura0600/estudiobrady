'use strict';
const DATA = { noticias: [], indicadores: [], servicios: [] };
const page = document.body.dataset.page || 'home';
const inPages = /\/pages\//.test(location.pathname);
const root = inPages ? '../' : './';
const pageUrl = name => inPages ? `${name}.html` : `pages/${name}.html`;
const homeUrl = inPages ? '../index.html' : './index.html';
const money = value => Number(value).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 });
const safe = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

function readLocal(key) {
  try { const value = localStorage.getItem(`brady_${key}`); const parsed = value ? JSON.parse(value) : null; return Array.isArray(parsed) ? parsed : null; }
  catch (_) { return null; }
}
async function loadJson(name) {
  try {
    const response = await fetch(`${root}data/${name}.json`);
    if (!response.ok) throw new Error('No se pudo cargar el archivo');
    const result = await response.json();
    return Array.isArray(result) ? result : [];
  } catch (_) { return []; }
}
async function boot() {
  for (const key of Object.keys(DATA)) DATA[key] = readLocal(key) || await loadJson(key);
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = nav() + render(page) + foot();
  initNavigation();
  if (page === 'noticias') initNews();
  if (page === 'calculadoras') initCalcs();
  if (page === 'contacto') initContact();
  if (page === 'admin') initAdmin();
}
function nav() {
  const links = [
    ['Inicio', homeUrl, 'home'], ['Noticias', pageUrl('noticias'), 'noticias'],
    ['Indicadores', pageUrl('indicadores'), 'indicadores'], ['Calculadoras', pageUrl('calculadoras'), 'calculadoras'],
    ['Servicios', pageUrl('servicios'), 'servicios'], ['El estudio', pageUrl('nosotros'), 'nosotros']
  ];
  return `<header class="nav"><div class="navin"><a class="logo" href="${homeUrl}" aria-label="Estudio Brady, inicio">BRADY<small>ESTUDIO CONTABLE</small></a><button class="menu" type="button" aria-expanded="false" aria-controls="site-links">Menú</button><nav class="navlinks" id="site-links" aria-label="Navegación principal">${links.map(([label,url,key]) => `<a href="${url}"${page===key?' aria-current="page"':''}>${label}</a>`).join('')}<a class="contact" href="${pageUrl('contacto')}"${page==='contacto'?' aria-current="page"':''}>Contacto</a></nav></div></header>`;
}
function foot() {
  return `<footer><div class="wrap"><span><strong>Estudio Brady</strong> · Luján, Buenos Aires</span><span>Contabilidad · Impuestos · Gestión</span><a href="${pageUrl('admin')}">Acceso administrativo</a></div></footer>`;
}
function pageHeading(kicker, title, lead='') {
  return `<div class="kicker">${safe(kicker)}</div><h1 class="display">${title}</h1>${lead ? `<p class="page-lead">${lead}</p>` : ''}`;
}
function render(which) {
  if (which === 'home') return home();
  if (which === 'noticias') return `<main class="section"><div class="wrap">${pageHeading('Novedades y artículos','Información contable e impositiva para el día a día.','Notas breves para entender cambios, ordenar la gestión y tomar decisiones con información clara.') }<div class="filters"><input id="q" type="search" aria-label="Buscar noticias" placeholder="Buscar por tema o palabra"><select id="cat" aria-label="Filtrar por categoría"><option value="">Todas las categorías</option></select><select id="sort" aria-label="Ordenar artículos"><option value="new">Más recientes</option><option value="old">Más antiguos</option></select></div><div id="news" class="archive" aria-live="polite"></div></div></main>`;
  if (which === 'noticia') {
    const id = new URLSearchParams(location.search).get('id');
    const article = DATA.noticias.find(item => String(item.id) === String(id)) || DATA.noticias[0];
    if (!article) return `<main class="section"><div class="wrap"><h1 class="display">Artículo no encontrado</h1><p>El artículo que buscás no está disponible.</p><a class="btn alt" href="${pageUrl('noticias')}">Volver a noticias</a></div></main>`;
    return `<main class="section"><article class="wrap article-body"><div class="kicker">${safe(article.categoria)} · ${safe(article.fecha)}</div><h1 class="display">${safe(article.titulo)}</h1><p class="article-summary">${safe(article.resumen)}</p><div class="rule" style="margin:28px 0"></div><p>${safe(article.contenido)}</p><a class="btn alt" href="${pageUrl('noticias')}">← Volver a noticias</a></article></main>`;
  }
  if (which === 'indicadores') return indicators();
  if (which === 'calculadoras') return calcs();
  if (which === 'servicios') return `<main class="section"><div class="wrap">${pageHeading('Servicios profesionales','Asesoramiento para trabajar con más tranquilidad.','Acompañamos a personas, profesionales y empresas en sus obligaciones contables y en la organización de su actividad.') }<div class="grid3">${DATA.servicios.map(s => `<article class="panel"><span class="tag">${safe(s.id || 'Servicio')}</span><h2>${safe(s.nombre)}</h2><p>${safe(s.descripcion)}</p><a href="${pageUrl('contacto')}">Consultar por este servicio →</a></article>`).join('')}</div><p class="notice" style="margin-top:22px">El alcance de cada servicio se define según la situación y las necesidades de cada cliente.</p></div></main>`;
  if (which === 'nosotros') return `<main class="section"><div class="wrap about-copy"><div class="kicker">El estudio</div><h1 class="display">Un trato directo y un trabajo bien hecho.</h1><p class="article-summary">En Estudio Brady creemos que el asesoramiento contable tiene que ser claro, ordenado y útil para quien lo necesita.</p><p>Trabajar con números también implica escuchar, entender cómo funciona cada actividad y explicar las obligaciones sin sumar complicaciones innecesarias. Buscamos que cada cliente sepa qué tiene que hacer, cuándo hacerlo y qué información necesita para organizarse mejor.</p><h2>Cómo trabajamos</h2><ul><li>Comunicación clara y seguimiento de los temas pendientes.</li><li>Planificación de vencimientos y obligaciones.</li><li>Información ordenada para acompañar decisiones.</li></ul><a class="btn" href="${pageUrl('contacto')}">Contactar al estudio</a></div></main>`;
  if (which === 'contacto') return `<main class="section"><div class="wrap"><div class="kicker">Contacto</div><h1 class="display">Contanos en qué podemos ayudarte.</h1><p class="article-summary">Dejanos tus datos y una breve descripción de tu consulta.</p><div class="formgrid"><form id="contact-form" class="panel"><label>Nombre y apellido<input name="nombre" required autocomplete="name" placeholder="Tu nombre"></label><label>Correo electrónico<input name="email" type="email" required autocomplete="email" placeholder="nombre@empresa.com"></label><label class="full">Empresa o actividad (opcional)<input name="empresa" autocomplete="organization" placeholder="Nombre de la empresa o actividad"></label><label class="full">Consulta<textarea name="consulta" required placeholder="Escribí brevemente qué necesitás resolver"></textarea></label><button class="btn" type="submit">Preparar consulta</button><p class="msg micro full" id="contact-message">El formulario abrirá tu aplicación de correo para que puedas enviar el mensaje.</p></form><aside class="panel"><div class="kicker">Estudio Brady</div><h2>Luján, Buenos Aires</h2><p>Atención contable e impositiva para personas, profesionales y empresas.</p><div class="rule" style="margin:22px 0"></div><p class="micro">Si ya trabajás con el estudio, incluí en tu mensaje el tema por el que necesitás asistencia.</p></aside></div></div></main>`;
  if (which === 'admin') return adminShell();
  return `<main class="section"><div class="wrap"><h1 class="display">Página no encontrada</h1><a href="${homeUrl}">Volver al inicio</a></div></main>`;
}
function home() {
  return `<main><section class="hero"><div class="wrap hero-inner"><div class="hero-copy"><div class="kicker">Estudio contable · Luján, Buenos Aires</div><h1 class="display">Asesoramiento contable, impositivo y de gestión.</h1><p>Ayudamos a personas y empresas a cumplir con sus obligaciones, mantener la información ordenada y entender mejor los números de su actividad.</p><div class="hero-actions"><a class="btn" href="${pageUrl('contacto')}">Contactar al estudio</a><a class="btn alt" href="${pageUrl('servicios')}">Ver servicios</a></div><div class="trustline"><span>Atención personalizada</span><span>Información clara</span><span>Seguimiento profesional</span></div></div><aside class="hero-side"><div class="kicker">Estudio Brady</div><h2>Un estudio contable cerca de tu actividad.</h2><p>Un espacio para consultar, planificar y llevar al día los temas contables e impositivos.</p><div class="office-note"><strong>¿Tenés una consulta?</strong><br>Podés contarnos tu situación y evaluar con el estudio cuál es el próximo paso.</div></aside></div></section><section class="quote"><div class="wrap"><div class="kicker">Nuestra forma de trabajar</div><p>La información contable tiene que servir para algo más que cumplir con una obligación: tiene que ayudarte a entender cómo está funcionando tu actividad.</p></div></section><section class="section"><div class="wrap"><div class="sectionhead"><div><div class="kicker">Novedades</div><h2>Información para estar al día.</h2></div><a href="${pageUrl('noticias')}">Ver todos los artículos →</a></div>${DATA.noticias.slice(0,3).map((n,i)=>`<a class="newsrow" href="${pageUrl('noticia')}?id=${encodeURIComponent(n.id)}"><span class="indexno">${safe(n.categoria)}</span><h3>${safe(n.titulo)}</h3><span class="micro">${safe(n.fecha)}</span></a>`).join('')}</div></section><section class="section" style="padding-top:0"><div class="wrap"><div class="sectionhead"><div><div class="kicker">Recursos</div><h2>Herramientas y servicios.</h2></div></div><div class="grid3 home-cards"><article class="panel"><span class="tag">Indicadores</span><h3>Datos económicos de referencia</h3><p>Consultá los valores de ejemplo disponibles en el sitio.</p><a href="${pageUrl('indicadores')}">Consultar indicadores →</a></article><article class="panel"><span class="tag">Calculadoras</span><h3>Cálculos de uso frecuente</h3><p>Hacé estimaciones sencillas de porcentajes, IVA y rentabilidad.</p><a href="${pageUrl('calculadoras')}">Usar calculadoras →</a></article><article class="panel"><span class="tag">Servicios</span><h3>Asesoramiento para tu actividad</h3><p>Conocé las áreas de trabajo y realizá una consulta.</p><a href="${pageUrl('servicios')}">Ver servicios →</a></article></div></div></section></main>`;
}
function indicators() {
  return `<main class="section"><div class="wrap"><div class="kicker">Información económica</div><h1 class="display">Indicadores de referencia.</h1><p class="article-summary">Una vista general de variables económicas para fines ilustrativos.</p><p class="notice">Atención: los valores que aparecen a continuación son datos de demostración. No son cotizaciones ni indicadores oficiales actualizados.</p><div class="indgrid">${DATA.indicadores.map(x=>`<article class="ind"><span class="tag">${safe(x.tipo)}</span><h3>${safe(x.nombre)}</h3><div class="value">${safe(x.valor)}</div><div class="${safe(x.direccion)}">${safe(x.variacion)}</div><div class="chart" aria-label="Gráfico ilustrativo">${(Array.isArray(x.hist)?x.hist:[]).map(v=>`<i style="height:${Math.max(3,Math.min(100,Number(v)||3))}%"></i>`).join('')}</div></article>`).join('')}</div></div></main>`;
}
function calcs() {
  const field = (id,label,placeholder,type='number',value='') => `<label>${label}<input id="${id}" type="${type}" ${type==='number'?'step="any"':''} ${value!==''?`value="${value}"`:''} placeholder="${placeholder}" /></label>`;
  const calc = (title,fields,button,id) => `<section class="calc"><h3>${title}</h3>${fields}<button class="btn" type="button" data-calc="${id}">Calcular</button><output class="result" id="out-${id}" aria-live="polite">Ingresá los valores para obtener un resultado.</output></section>`;
  return `<main class="section"><div class="wrap"><div class="kicker">Herramientas</div><h1 class="display">Calculadoras prácticas.</h1><p class="article-summary">Estimaciones rápidas para hacer cuentas habituales. Los resultados no reemplazan el asesoramiento profesional ni contemplan todos los casos particulares.</p><div class="calcgrid">${calc('Interés compuesto',field('p','Capital inicial','Ej. 100000')+field('r','Tasa anual (%)','Ej. 30')+field('n','Plazo en años','Ej. 3'),'Calcular proyección','compound')}${calc('IVA',field('b','Importe neto','Ej. 50000')+field('iv','Alícuota (%)','Ej. 21','number','21'),'Calcular total','iva')}${calc('Aumento porcentual',field('ab','Valor original','Ej. 25000')+field('ar','Aumento (%)','Ej. 15'),'Calcular aumento','increase')}${calc('Descuento',field('db','Precio original','Ej. 25000')+field('dr','Descuento (%)','Ej. 10'),'Calcular descuento','discount')}${calc('Inflación acumulada',field('i1','Primer período (%)','Ej. 5')+field('i2','Segundo período (%)','Ej. 4')+field('i3','Tercer período (%)','Ej. 3'),'Calcular acumulado','inflation')}${calc('Rentabilidad',field('g','Ganancia neta','Ej. 20000')+field('inv','Inversión inicial','Ej. 100000'),'Calcular rentabilidad','return')}</div></div></main>`;
}
function initNavigation() {
  const button = document.querySelector('.menu');
  const links = document.querySelector('.navlinks');
  if (button && links) button.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(open));
  });
}
function initNews() {
  const query = document.getElementById('q'), category = document.getElementById('cat'), sort = document.getElementById('sort'), container = document.getElementById('news');
  if (!query || !category || !sort || !container) return;
  [...new Set(DATA.noticias.map(n=>n.categoria).filter(Boolean))].sort().forEach(value => category.add(new Option(value,value)));
  const dateValue = value => { const parts=String(value||'').split(/[./-]/).map(Number); if(parts.length===3){const [a,b,c]=parts;return new Date(c>31?c:a,b-1,c>31?a:c).getTime()||0;} return 0; };
  function draw() {
    const q=query.value.trim().toLocaleLowerCase('es-AR'); let rows=DATA.noticias.filter(n=>(`${n.titulo||''} ${n.resumen||''} ${n.categoria||''}`).toLocaleLowerCase('es-AR').includes(q));
    if(category.value) rows=rows.filter(n=>n.categoria===category.value);
    rows.sort((a,b)=>sort.value==='old'?dateValue(a.fecha)-dateValue(b.fecha):dateValue(b.fecha)-dateValue(a.fecha));
    container.innerHTML=rows.map(n=>`<article class="story"><span class="tag">${safe(n.categoria)}</span><div class="kicker">${safe(n.fecha)}</div><h2>${safe(n.titulo)}</h2><p class="micro">${safe(n.resumen)}</p><a href="${pageUrl('noticia')}?id=${encodeURIComponent(n.id)}">Leer artículo →</a></article>`).join('')||'<p class="panel">No hay artículos que coincidan con la búsqueda.</p>';
  }
  [query,category,sort].forEach(el=>el.addEventListener('input',draw)); draw();
}
function initCalcs() {
  const val=id=>{const el=document.getElementById(id);return el?Number(el.value):NaN;};
  const result=(id,text)=>{const el=document.getElementById(`out-${id}`);if(el)el.textContent=text;};
  const read=(id,ids,fn,format='money')=>{const values=ids.map(val);if(values.some(v=>!Number.isFinite(v))){result(id,'Completá todos los campos con números válidos.');return;}let answer;try{answer=fn(...values);}catch(_){answer=NaN;}if(!Number.isFinite(answer)){result(id,'Revisá los valores ingresados e intentá nuevamente.');return;}result(id,format==='percent'?`${answer.toLocaleString('es-AR',{maximumFractionDigits:2})}%`:money(answer));};
  document.querySelectorAll('[data-calc]').forEach(button=>button.addEventListener('click',()=>{
    const id=button.dataset.calc;
    if(id==='compound')read(id,['p','r','n'],(p,r,n)=>p<0||n<0||r<=-100?NaN:p*Math.pow(1+r/100,n));
    else if(id==='iva')read(id,['b','iv'],(b,r)=>b*(1+r/100));
    else if(id==='increase')read(id,['ab','ar'],(b,r)=>b*(1+r/100));
    else if(id==='discount')read(id,['db','dr'],(b,r)=>b<0||r<0||r>100?NaN:b*(1-r/100));
    else if(id==='inflation')read(id,['i1','i2','i3'],(a,b,c)=>((1+a/100)*(1+b/100)*(1+c/100)-1)*100,'percent');
    else if(id==='return')read(id,['g','inv'],(g,investment)=>investment<=0?NaN:g/investment*100,'percent');
    
  }));
}
function initContact() {
  const form=document.getElementById('contact-form'); if(!form)return;
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const fields=new FormData(form); const subject=encodeURIComponent(`Consulta para Estudio Brady: ${fields.get('nombre')}`);
    const body=encodeURIComponent(`Nombre: ${fields.get('nombre')}\nCorreo: ${fields.get('email')}\nEmpresa o actividad: ${fields.get('empresa')||'No indicado'}\n\nConsulta:\n${fields.get('consulta')}`);
    const message=document.getElementById('contact-message');
    message.textContent='Se va a abrir tu aplicación de correo. Revisá el destinatario y enviá el mensaje desde ahí.';
    location.href=`mailto:contacto@estudiobrady.com?subject=${subject}&body=${body}`;
  });
}
function adminShell(){return `<main class="section"><div class="wrap"><div class="kicker">Administración local</div><h1 class="display">Contenido del sitio.</h1><p class="article-summary">Desde aquí podés editar el contenido guardado en este navegador o importar y exportar una copia JSON.</p><div class="dash"><div class="panel"><span class="micro">ARTÍCULOS</span><h2>${DATA.noticias.length}</h2></div><div class="panel"><span class="micro">INDICADORES</span><h2>${DATA.indicadores.length}</h2></div><div class="panel"><span class="micro">SERVICIOS</span><h2>${DATA.servicios.length}</h2></div><div class="panel"><span class="micro">ALMACENAMIENTO</span><h2>Local</h2></div></div><div class="adminbar"><button type="button" data-collection="noticias">Editar noticias</button><button type="button" data-collection="indicadores">Editar indicadores</button><button type="button" data-collection="servicios">Editar servicios</button><button type="button" id="export-json">Exportar JSON</button><button type="button" id="import-trigger">Importar JSON</button><input id="import-file" type="file" accept="application/json,.json" hidden></div><div id="cmslist"></div><p class="notice">Este panel no tiene inicio de sesión y los cambios se guardan solo en este navegador. No publiques información privada aquí. Para compartir cambios con todos los visitantes hace falta conectar un CMS o una base de datos.</p></div></main>`;}
let activeCollection='noticias';
function initAdmin(){
  document.querySelectorAll('[data-collection]').forEach(button=>button.addEventListener('click',()=>editCollection(button.dataset.collection)));
  document.getElementById('export-json')?.addEventListener('click',exportData);
  document.getElementById('import-trigger')?.addEventListener('click',()=>document.getElementById('import-file').click());
  document.getElementById('import-file')?.addEventListener('change',importData);
  editCollection('noticias');
}
function editCollection(key){
  if(!DATA[key])return; activeCollection=key;
  const container=document.getElementById('cmslist'); if(!container)return;
  container.innerHTML=`<h2>${key==='noticias'?'Noticias y artículos':key==='indicadores'?'Indicadores':'Servicios'}</h2>${DATA[key].map((item,index)=>`<div class="cmsrow"><span>${safe(item.titulo||item.nombre||item.valor||'Elemento sin título')}</span><span>${safe(item.categoria||item.tipo||item.id||'')}</span><span><button type="button" data-edit="${index}">Editar</button><button type="button" data-delete="${index}" aria-label="Eliminar elemento">Eliminar</button></span></div>`).join('')}<button class="btn" type="button" id="add-item" style="margin-top:20px">+ Agregar elemento</button>`;
  container.querySelectorAll('[data-edit]').forEach(button=>button.addEventListener('click',()=>editItem(key,Number(button.dataset.edit))));
  container.querySelectorAll('[data-delete]').forEach(button=>button.addEventListener('click',()=>deleteItem(key,Number(button.dataset.delete))));
  container.querySelector('#add-item')?.addEventListener('click',()=>addItem(key));
}
function editItem(key,index){
  const item=DATA[key][index]; if(!item)return;
  const fields=key==='noticias'?['titulo','categoria','fecha','resumen','contenido']:key==='indicadores'?['nombre','tipo','valor','variacion','direccion']:['nombre','descripcion'];
  const changes={};
  for(const field of fields){const value=prompt(`Editar ${field}`,item[field]??'');if(value===null)return;changes[field]=value;}
  Object.assign(item,changes);
  if(key==='indicadores'&&!Array.isArray(item.hist))item.hist=[25,35,45,40,55];
  persist(key);editCollection(key);
}
function deleteItem(key,index){if(!confirm('¿Querés eliminar este elemento?'))return;DATA[key].splice(index,1);persist(key);editCollection(key);}
function addItem(key){
  const name=prompt(key==='noticias'?'Título del artículo':key==='indicadores'?'Nombre del indicador':'Nombre del servicio');if(!name||!name.trim())return;
  const id=Date.now();
  const item=key==='noticias'?{id,categoria:'General',fecha:new Date().toLocaleDateString('es-AR'),titulo:name.trim(),resumen:'Agregar un resumen descriptivo.',contenido:'Completar el contenido del artículo.'}:key==='indicadores'?{id,nombre:name.trim(),tipo:'Referencia',valor:'A completar',variacion:'Dato ilustrativo',direccion:'up',hist:[25,35,45,40,55]}:{id:String(DATA[key].length+1).padStart(2,'0'),nombre:name.trim(),descripcion:'Completar la descripción del servicio.'};
  DATA[key].push(item);persist(key);editCollection(key);
}
function persist(key){try{localStorage.setItem(`brady_${key}`,JSON.stringify(DATA[key]));}catch(_){alert('No se pudieron guardar los cambios en este navegador.');}}
function exportData(){const blob=new Blob([JSON.stringify(DATA,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='estudio-brady-contenido.json';document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url);}
function importData(event){const file=event.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const parsed=JSON.parse(reader.result);for(const key of Object.keys(DATA)){if(Array.isArray(parsed[key])){DATA[key]=parsed[key];persist(key);}}alert('Importación completada. Revisá las secciones para confirmar los datos.');editCollection(activeCollection);}catch(_){alert('El archivo no es un JSON válido o no tiene el formato esperado.');}event.target.value='';};reader.readAsText(file);}
boot();
