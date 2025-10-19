#!/usr/bin/env node
// Obtiene coordenadas desde la página "carte" de Descente-Canyon y las inserta en el dataset.
// Usa con moderación y revisa los términos de uso del sitio antes de automatizar muchas peticiones.

import fs from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_SOURCE = process.env.SOURCE || 'src/data/canyons_espana_descente_con_wikiloc.json';
const DEFAULT_OUTPUT = process.env.OUTPUT || DEFAULT_SOURCE;
const BASE_URL = 'https://www.descente-canyon.com/canyoning/canyon-carte';
const DEFAULT_DELAY_MS = Number(process.env.DELAY_MS || 5000);
const DEFAULT_ZOOM = Number(process.env.ZOOM || 14);

const parseArgs = (argv) => {
  const options = {};
  argv.slice(2).forEach((arg) => {
    const [rawKey, rawValue] = arg.split('=');
    if (!rawKey) return;
    const key = rawKey.replace(/^--/, '').trim();
    const value = rawValue === undefined ? true : rawValue.trim();
    options[key] = value;
  });
  return options;
};

const resolvePath = (relative) => path.resolve(__dirname, '..', relative);

const loadDataset = async (filePath) => {
  const absolute = resolvePath(filePath);
  const raw = await fs.readFile(absolute, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error('El archivo JSON no contiene un array');
  }
  return { absolute, data };
};

const fetchMapPage = async (canyonId) => {
  const url = `${BASE_URL}/${encodeURIComponent(canyonId)}/carte.html`;
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        process.env.USER_AGENT ||
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      Connection: 'keep-alive',
    },
  });

  if (!response.ok) {
    throw new Error(`Descente-Canyon respondió ${response.status} en ${url}`);
  }

  return response.text();
};

const markerRegex = /new google\.maps\.LatLng\(([-\d.]+),([-\d.]+)\),type: '([^']+)'/g;

const parseMarkers = (html) => {
  const markers = [];
  let match;
  while ((match = markerRegex.exec(html)) !== null) {
    const lat = Number.parseFloat(match[1]);
    const lng = Number.parseFloat(match[2]);
    const type = match[3];
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      markers.push({ type, lat, lng });
    }
  }
  return markers;
};

const pickPrimaryMarker = (markers) => {
  if (!Array.isArray(markers) || markers.length === 0) {
    return null;
  }
  const priority = ['depart', 'parking', 'arrivee', 'point_externe', 'point_interne'];
  for (const type of priority) {
    const found = markers.find((marker) => marker.type === type);
    if (found) {
      return found;
    }
  }
  return markers[0];
};

const enrichCanyon = (canyon, markers, zoom) => {
  if (!markers || markers.length === 0) {
    return canyon;
  }
  const primary = pickPrimaryMarker(markers);
  const existingMarkers = Array.isArray(canyon.descente_markers) ? canyon.descente_markers : [];
  const mergedMarkers = markers.reduce((acc, marker) => {
    if (!acc.some((item) => item.type === marker.type && item.lat === marker.lat && item.lng === marker.lng)) {
      acc.push(marker);
    }
    return acc;
  }, [...existingMarkers]);

  return {
    ...canyon,
    coordinates:
      primary && Number.isFinite(primary.lat) && Number.isFinite(primary.lng)
        ? {
            lat: primary.lat,
            lng: primary.lng,
            zoom: canyon.coordinates?.zoom ?? zoom,
          }
        : canyon.coordinates ?? null,
    descente_markers: mergedMarkers,
  };
};

const asFiniteNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const main = async () => {
  const args = parseArgs(process.argv);
  const sourcePath = args.source || DEFAULT_SOURCE;
  const outputPath = args.output || DEFAULT_OUTPUT;
  const delayMs = asFiniteNumber(args.delay) ?? DEFAULT_DELAY_MS;
  const zoom = asFiniteNumber(args.zoom) ?? DEFAULT_ZOOM;
  const limit = asFiniteNumber(args.limit);
  const dryRun = args['dry-run'] === 'true' || args['dry'] === 'true';
  const startAt = asFiniteNumber(args.start) ?? 0;

  const { data } = await loadDataset(sourcePath);

  let processed = 0;
  let updated = 0;

  for (let index = 0; index < data.length; index += 1) {
    if (index < startAt) {
      continue;
    }
    const item = data[index];
    if (!item?.id) {
      continue;
    }
    if (limit !== undefined && processed >= limit) {
      break;
    }
    processed += 1;

    try {
      console.log(`Buscando coordenadas Descente-Canyon para ID=${item.id} (${item.nombre ?? item.name ?? 'sin nombre'})`);
      const html = await fetchMapPage(item.id);
      const markers = parseMarkers(html);
      if (markers.length === 0) {
        console.warn(`  ⚠️  No se encontraron marcadores en la ficha ${item.id}`);
        continue;
      }
      const enriched = enrichCanyon(item, markers, zoom);
      data[index] = enriched;
      updated += 1;
      console.log(
        `  ✓ ${markers.length} marcadores encontrados${enriched.coordinates ? ` · coordenada principal: ${enriched.coordinates.lat.toFixed(6)}, ${enriched.coordinates.lng.toFixed(6)}` : ''}`
      );
    } catch (error) {
      console.error(`  ❌ Error con ID=${item.id}: ${error.message}`);
    }

    if (delayMs > 0 && index < data.length - 1) {
      await sleep(delayMs);
    }
  }

  if (dryRun) {
    console.log(`Modo simulación: ${updated} registros se habrían actualizado. No se escribieron cambios.`);
    return;
  }

  const absoluteOutput = resolvePath(outputPath);
  await fs.writeFile(absoluteOutput, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  console.log(`✅ Guardado completado: ${updated} registros actualizados en ${absoluteOutput}`);
};

main().catch((error) => {
  console.error('❌ Error al ejecutar el script:', error.message);
  process.exitCode = 1;
});
