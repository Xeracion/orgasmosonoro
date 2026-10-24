# Orgasmo Sonoro

Landing de una sola página para las sesiones de música, respiración y cacao junto a las Fragas do Eume.

HTML, CSS y JS estáticos, sin dependencias ni paso de compilación. Se abre directamente con `index.html` o se despliega tal cual en Vercel, Netlify o GitHub Pages.

## Archivos

| Archivo | Qué contiene |
| --- | --- |
| `index.html` | Página completa, metadatos SEO, Open Graph, Twitter Card y schema (LocalBusiness y FAQPage) |
| `styles.css` | Estilos mobile-first con custom properties |
| `main.js` | Aparición de secciones, acordeón de preguntas, menú y envío del formulario |
| `privacidad.html` | Política de privacidad (responsable: Asociación Xeración) |
| `aviso-legal.html` | Aviso legal (LSSI) |
| `404.html` | Página de error para direcciones que no existen (Vercel la sirve sola) |
| `fran-sequeiro.jpg` | Retrato de Fran para la sección Quién lo guía |
| `og-image.jpg` | Imagen para compartir en redes (1200 × 630) |
| `logo-xeracion.png` | Logo de Xeración para el pie |
| `vercel.json` | Redirección 301 del dominio mal escrito al correcto |
| `google-apps-script/Code.gs` | Script que guarda los correos de la lista en Google Sheets |

## Conectar el formulario a Google Sheets

1. Crea una hoja de cálculo nueva en Google Drive.
2. Abre Extensiones > Apps Script, borra lo que haya y pega el contenido de `google-apps-script/Code.gs`.
3. Guarda y pulsa Implementar > Nueva implementación > Aplicación web, con "Ejecutar como: Yo" y "Quién tiene acceso: Cualquier usuario".
4. Autoriza los permisos y copia la URL que termina en `/exec`.
5. Pega esa URL en el `action` del `<form id="waitlist-form">` de `index.html` (ya está configurada la implementación actual).

Cada envío añade una fila con fecha, correo, origen (`utm_source` o la web de procedencia) y campaña (`utm_campaign`) en la pestaña "Lista de espera". Los correos repetidos no se duplican y un campo oculto filtra bots.

Si cambias el script, publica una nueva versión desde Implementar > Gestionar implementaciones para conservar la misma URL.

## Antes de publicar

1. El dominio es `orgasmosonoro.com`. Revisar el correo e Instagram del schema (`contacto@orgasmosonoro.com`, `@orgasmosonoro`), que son provisionales.
   `vercel.json` redirige con 301 `orgamosonoro.com` a `orgasmosonoro.com` si ese dominio se añade al proyecto de Vercel.
2. El formulario ya está conectado. Borra de la hoja la fila de prueba `prueba-web@orgamosonoro.com`.
3. Revisar la política de privacidad (`privacidad.html`) si cambia el uso de los datos o los proveedores.

## Cuando haya fecha cerrada

Poner la fecha en la pregunta "¿Cuándo es la próxima sesión?" de `index.html`, también en el schema FAQPage.
