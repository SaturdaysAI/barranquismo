# Proceso de creación del proyecto "canyoning-webapp"

Este documento resume las decisiones técnicas, comandos y prompts que se utilizaron durante la construcción de la aplicación. Servirá como guía para reproducir el mismo flujo de trabajo en otro entorno.

## 1. Configuración inicial
- **Repositorio**: `https://github.com/SaturdaysAI/barranquismo` (rama `main`).
- **Stack**: Vite + React 18, Router, PWA (vite-plugin-pwa), CSS plano.
- **Dependencias clave**: `cheerio` para scraping ligero, `workbox` para el service worker.
- **Scripts npm básicos**:
  - `npm run dev`
  - `npm run build`
  - `npm run preview`

### Prompts y acciones iniciales
- “`ya puedes hacerlo tu`” → se asumió control para investigar la API de Wikiloc.
- “`Continuar: "¿Desea continuar con la iteración?"`” → se confirmó el contexto para seguir iterando.

## 2. Normalización de datos
- Se decidió usar **solo** el archivo `src/data/canyons_espana_descente_con_wikiloc.json` como fuente principal.
- `src/data/canyons.js` importa este JSON, limpia nombres/ubicaciones y expone una lista fusionada con campos `coordinates`, `wikiloc`, `wikiloc_search_url`, etc.

### Pasos clave
1. Ajustar `canyons.js` para leer únicamente el JSON corregido.
2. Hacer `npm run build` tras cada edición para validar que la app compila.

## 3. Scripts creados
Todos se ubicaron en `scripts/` y se ejecutan con Node 18.

### 3.1 Generar enlace global de Wikiloc
Archivo: `scripts/add-wikiloc-search-links.mjs`

Uso:
```bash
node scripts/add-wikiloc-search-links.mjs
```

Parámetros opcionales (variables de entorno):
- `SOURCE`, `OUTPUT`: rutas relativas al proyecto.
- `WIKILOC_ACTIVITY`: filtrar por actividad (por defecto 46 = barranquismo).
- `WIKILOC_MAP_URL`: URL fija (por defecto `https://es.wikiloc.com/wikiloc/map.do?sw=35.95%2C-9.39&ne=43.75%2C3.04&act=46&page=1`).

### 3.2 Añadir coordenadas desde Descente-Canyon
Archivo: `scripts/fetch-descente-coordinates.mjs`

Uso típico:
```bash
node scripts/fetch-descente-coordinates.mjs --delay=0
```

Argumentos relevantes:
- `--limit=<n>`: limitar número de fichas.
- `--dry-run=true`: simular sin guardar.
- `--delay=<ms>`: pausa entre peticiones (evitar abusar del sitio).
- `--zoom=<nivel>`: zoom por defecto si no existe en el JSON.

El script:
1. Construye la URL `https://www.descente-canyon.com/canyoning/canyon-carte/<ID>/carte.html`.
2. Descarga el HTML y extrae las cadenas `new google.maps.LatLng(lat,lng)`.
3. Prioriza el marcador `depart` para guardarlo en `coordinates`.
4. Añade todos los marcadores a `descente_markers`.

## 4. Ajustes de interfaz
- `src/pages/BarrancoDetail.jsx`: ahora muestra un bloque "Enlaces útiles" con:
  - `wikiloc.approach`
  - `wikiloc.return`
  - enlace fijo "Buscar rutas en Wikiloc" (`wikiloc_search_url`).
- Si no hay `coordinates`, la sección de mapa despliega un aviso con enlace a Wikiloc en lugar del iframe.
- `src/components/MapPreview.jsx` sigue usando OpenStreetMap cuando hay coordenadas.

### Prompts destacados
- “`no tengo las coordenadas pon un enlace a wikiloc`” → motivó el fallback textual.
- “`si, ya que tiene que volver a coger los datos...`” → desencadenó el scraper de Descente-Canyon.
- “`quiero que el enlace a la pagina de wikilock sea este ...`” → actualizó el script de enlaces fijos.

## 5. Validaciones
- Builds periódicos: `npm run build`.
- Revisar cambios: `git status -sb`, `git diff`.
- Commits y push: `git commit -m "feat: ..."`, `git push origin main`.

## 6. Recursos externos consultados
- Wikiloc (páginas de búsqueda y endpoints dentro de la SPA).
- Descente-Canyon `carte.html` para cada ID (ejemplos proporcionados por el usuario):
  - `https://www.descente-canyon.com/canyoning/canyon-carte/23655/carte.html`
  - `https://www.descente-canyon.com/canyoning/canyon-carte/2753/carte.html`

## 7. Recomendaciones para repetir el proceso
1. Clonar repositorio y ejecutar `npm install`.
2. Verificar dataset principal (`src/data/canyons_espana_descente_con_wikiloc.json`).
3. Si se necesitan nuevos enlaces o coordenadas:
   - `node scripts/add-wikiloc-search-links.mjs`
   - `node scripts/fetch-descente-coordinates.mjs`
4. Ejecutar `npm run dev` para revisar la UI.
5. Ejecutar `npm run build` y subir cambios a GitHub.

## 8. Prompts/respuestas relevantes
| Nº | Prompt/acción del usuario | Respuesta/acción realizada |
|----|---------------------------|----------------------------|
| 1  | “¿Desea continuar con la iteración?” | Confirmamos el contexto y continuamos. |
| 2  | “he actualizado los datos del json...” | Ajustamos `canyons.js` para leer solo el JSON corregido. |
| 3  | “no tengo las coordenadas pon un enlace...” | Fallback en la vista con enlace a Wikiloc. |
| 4  | “si, ya que tiene que volver a coger los datos...” | Script `fetch-descente-coordinates.mjs`. |
| 5  | “quiero que el enlace... sea este” | Script de enlaces actualizado a la URL global. |

## 9. Próximos pasos sugeridos
- Revisar términos de uso de sitios externos antes de automatizar descargas masivas.
- Añadir tests automáticos para validar integridad del JSON (ej. llaves obligatorias, lat/lng finitos).
- Versionar los JSON para auditar futuras actualizaciones.

---
*Documento generado automáticamente desde la sesión del asistente para dejar constancia del flujo completo.*
