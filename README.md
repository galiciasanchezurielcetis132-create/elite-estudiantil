# Élite Estudiantil — versión 2

Sitio de campaña estudiantil en **un solo archivo** (`index.html`). Se abre con doble clic; no necesita instalar nada.

## Qué cambió respecto al prototipo

**Diseño y experiencia**
- Rediseño premium conservando guinda, dorado, crema y la capibara (ahora con parpadeo y corona animada).
- Modo claro/oscuro, barra de progreso, menú que resalta la sección actual, animaciones al desplazarse (respetan "reducir movimiento").
- Totalmente responsive, accesible (saltar al contenido, foco visible, etiquetas ARIA, navegación por teclado en pestañas).
- SEO básico: descripción, Open Graph, favicon y datos estructurados.

**Contenido nuevo**
- **Equipo** (nombres de ejemplo editables).
- **Realidad Tec 4**: cada tarjeta abre una ficha con por qué importa, cómo se haría y cómo se mide.
- **Propuestas** en pestañas, con estado y barra de avance (de preparación, no promesas).
- **Calendario** de campaña con botón "Agregar" (archivo .ics para su calendario).
- **Preguntas frecuentes**.
- **Compartir** por WhatsApp, menú nativo del celular y copiar enlace.
- **Aviso de privacidad** en ventana.

**Formularios**
- Validación con mensajes por campo, formato de grado y de contacto (correo o 10 dígitos), contador de caracteres.
- Buzón: avisa si se escribe un teléfono, correo o enlace y no deja enviarlo.
- Trampa anti-bots (campo oculto) y reintento automático si no hay conexión.

## Datos: las tres vías juntas

Siempre se guarda una copia en el navegador. Además, en el bloque `CONFIG` al inicio del `<script>` puedes activar:

| Vía | Qué llenar | Para quién |
|---|---|---|
| **Local + panel** | Nada. Pie de página → *Administración* (o abre `index.html#admin`). Crea un PIN, filtra, borra y descarga CSV. | Pruebas. El PIN es una barrera básica, no seguridad real. |
| **Google Sheets** | `sheetsUrl` con la URL de la app web. Pasos en `backend/apps-script.gs`. | Lo más simple y gratis para una campaña. |
| **Servidor propio** | `apiUrl` (y opcional `apiToken`). Corre `backend/server.js`. | Si tienen hosting y alguien que lo administre. |

Se pueden activar Sheets y servidor a la vez; el aviso de privacidad y las notas de los formularios cambian solos según lo configurado.

> Nunca pongas el `ADMIN_TOKEN` del servidor en `index.html`: todo lo que está ahí lo puede leer cualquiera.

## Antes de publicar (pendientes de ustedes)

1. Cambiar los nombres del equipo, fotos y fechas del calendario (`CONFIG.team`, `CONFIG.events`). Las fechas actuales son de ejemplo.
2. Rellenar `CONFIG.privacyOwner` con quién es responsable de los datos y cómo contactarlo.
3. Obtener autorización de la escuela cuando corresponda, y avisar a familias si hay menores involucrados (fotos y datos).
4. Decidir quién lee el buzón y cada cuánto. **No es un canal de emergencia** y así lo dice el sitio.
5. Publicarlo: GitHub Pages, Netlify o Cloudflare Pages (arrastrar la carpeta). Sin HTTPS no funcionan algunas funciones (copiar enlace, PIN con hash fuerte).

## Probar el servidor propio

```bash
cd backend
ADMIN_TOKEN=clave-larga-aqui WRITE_TOKEN=token-publico ALLOWED_ORIGIN=https://tusitio.com node server.js
curl -H "Authorization: Bearer clave-larga-aqui" http://localhost:3000/api/export/support
```
