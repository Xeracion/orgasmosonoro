# Orgamo Sonoro

Landing de una sola página para los encuentros de música, respiración y cacao junto a las Fragas do Eume.

HTML, CSS y JS estáticos, sin dependencias ni paso de compilación. Se abre directamente con `index.html` o se despliega tal cual en Vercel, Netlify o GitHub Pages.

## Archivos

| Archivo | Qué contiene |
| --- | --- |
| `index.html` | Página completa, metadatos SEO, Open Graph, Twitter Card y schema (LocalBusiness y FAQPage) |
| `styles.css` | Estilos mobile-first con custom properties |
| `main.js` | Aparición de secciones, acordeón de preguntas y formulario |
| `og-image.jpg` | Imagen para compartir en redes (1200 × 630) |
| `logo-xeracion.png` | Logo de Xeración para el pie |

## Antes de publicar

1. Sustituir los placeholders: dominio `orgamosonoro.com` (canonical, Open Graph y schema), `contacto@orgamosonoro.com` e `@orgamosonoro`.
2. Conectar el formulario a Brevo o Mailchimp: cambiar el `action` del `<form id="waitlist-form">` y el listener de `main.js` (ahora muestra un `alert`).
