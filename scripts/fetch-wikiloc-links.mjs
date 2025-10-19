#!/usr/bin/env node
// Script to enrich canyon datasets with Wikiloc links by name search.
// Verify Wikiloc's terms of service before using this script against their site.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';

const DEFAULT_HEADERS = {
  'User-Agent':
    process.env.WIKILOC_USER_AGENT ||
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': process.env.WIKILOC_ACCEPT_LANGUAGE || 'es-ES,es;q=0.9,en;q=0.8',
  Referer: process.env.WIKILOC_REFERER || 'https://www.wikiloc.com/wikiloc/map.do',
  Origin: process.env.WIKILOC_ORIGIN || 'https://www.wikiloc.com',
  Connection: 'keep-alive',
};

const readExtraHeaders = () => {
  const raw = process.env.WIKILOC_HEADERS;
  if (!raw) {
    return {};
  }
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return Object.fromEntries(
        Object.entries(parsed).map(([key, value]) => [key, String(value)])
      );
    }
  } catch (error) {
    console.warn('No se pudo interpretar WIKILOC_HEADERS como JSON:', error.message);
  }
  return {};
};

const SESSION_HEADERS = {
  ...DEFAULT_HEADERS,
  ...readExtraHeaders(),
};

if (process.env.WIKILOC_COOKIE) {
  SESSION_HEADERS.Cookie = process.env.WIKILOC_COOKIE;
}

const resolveNumberOr = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const DEFAULT_ACTIVITY = process.env.WIKILOC_ACTIVITY || '46';
const DEFAULT_LIMIT = resolveNumberOr(process.env.WIKILOC_LIMIT, 10);
const DEFAULT_RADIUS_KM = resolveNumberOr(process.env.WIKILOC_RADIUS_KM, 15);
const USE_MAP_ENDPOINT = process.env.WIKILOC_USE_MAP !== 'false';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://www.wikiloc.com';
const DEFAULT_INPUT = 'src/data/canyons.seed.json';
const DEFAULT_DELAY_MS = 4000;

const parseArgs = (argv) => {
  const args = argv.slice(2);
  const options = {};
  for (const arg of args) {
    const [rawKey, rawValue] = arg.split('=');
    if (!rawKey) continue;
    const key = rawKey.replace(/^--/, '').trim();
    const value = rawValue === undefined ? true : rawValue.trim();
    options[key] = value;
  }
  return options;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseOptionalNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const normalizeString = (value) => {
  if (typeof value !== 'string') {
    return '';
  }
  return value
    .replace(/\s+/g, ' ')
    .replace(/\)(?=[^\s])/g, ') ')
    .replace(/([a-záéíóúñ])([A-ZÁÉÍÓÚÑ])/g, '$1 $2')
    .replace(/([A-Za-zÁÉÍÓÚáéíóúñ])\(/g, '$1 (')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

const simplifyLocationLabel = (value) => {
  const normalized = normalizeString(value);
  if (!normalized) {
    return '';
  }
  return normalized.replace(/^(provincia|departamento|region|región|comunidad|province|department|state|estado) de\s+/i, '').trim();
};

const collectLocationParts = (item) => {
  const candidates = [
    item.localidad,
    item.municipio,
    item.municipality,
    item.provincia,
    item.departamento,
    item.department,
    item.province,
    item.region,
    item.región,
    item.zona,
  ];
  return Array.from(new Set(candidates.map((value) => simplifyLocationLabel(value)).filter(Boolean)));
};

const stripParentheticalContent = (value) => {
  return value.replace(/\([^\)]*\)/g, '').replace(/\s{2,}/g, ' ').trim();
};

const stripLocationFromName = (name, item) => {
  const normalizedName = normalizeString(name);
  if (!normalizedName) {
    return '';
  }
  let cleaned = normalizedName;
  collectLocationParts(item).forEach((part) => {
    const escaped = part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (!escaped) {
        return;
      }
      const locationWithParen = new RegExp(`\\s+${escaped}\\s*\\([^)]*\\)`, 'i');
      cleaned = cleaned.replace(locationWithParen, ' ').trim();
      const trailing = new RegExp(`\\s+${escaped}$`, 'i');
      cleaned = cleaned.replace(trailing, '').trim();
      const withParen = new RegExp(`\\s*\\(\\s*${escaped}\\s*\\)$`, 'i');
      cleaned = cleaned.replace(withParen, '').trim();
    const boundary = new RegExp(`(^|\s)${escaped}(?=\s|$)`, 'i');
    cleaned = cleaned.replace(boundary, ' ').trim();
  });
  cleaned = stripParentheticalContent(cleaned);
  return cleaned || normalizedName;
};

const buildQuery = (item) => {
  const baseName = stripLocationFromName(item.name ?? item.nombre, item);
  if (baseName) {
    return baseName;
  }
  return normalizeString(item.name ?? item.nombre ?? '');
};

const toFiniteNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const buildBoundingBox = (coordinates, radiusKm = DEFAULT_RADIUS_KM) => {
  if (!coordinates) {
    return null;
  }
  const lat = toFiniteNumber(coordinates.lat);
  const lng = toFiniteNumber(coordinates.lng);
  if (lat === undefined || lng === undefined) {
    return null;
  }
  const radius = toFiniteNumber(radiusKm) ?? DEFAULT_RADIUS_KM;
  const latDelta = radius / 111.32;
  const lngDenominator = Math.cos((lat * Math.PI) / 180) * 111.32;
  const lngDelta = lngDenominator === 0 ? radius / 111.32 : radius / lngDenominator;

  const minLat = Math.max(-90, lat - latDelta);
  const maxLat = Math.min(90, lat + latDelta);
  const minLng = Math.max(-180, lng - lngDelta);
  const maxLng = Math.min(180, lng + lngDelta);

  return {
    minLat,
    maxLat,
    minLng,
    maxLng,
  };
};

const appendSearchParams = (url, params) => {
  if (!params) {
    return;
  }
  const searchParams = new URLSearchParams(params);
  for (const [key, value] of searchParams.entries()) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  }
};

const fetchMapResults = async ({ query, coordinates, radiusKm, extraParams, activity }) => {
  if (!USE_MAP_ENDPOINT) {
    return { json: null, raw: null };
  }

  const url = new URL(`${BASE_URL}/find.do`);
  url.searchParams.set('event', 'map');
  url.searchParams.set('start', '0');
  const activityFilter = activity ?? DEFAULT_ACTIVITY;
  if (activityFilter) {
    url.searchParams.set('act', activityFilter);
  }
  url.searchParams.set('limit', String(DEFAULT_LIMIT));
  url.searchParams.set('text', query);

  const boundingBox = buildBoundingBox(coordinates, radiusKm);
  if (boundingBox) {
    url.searchParams.set('minLat', boundingBox.minLat.toFixed(6));
    url.searchParams.set('minLng', boundingBox.minLng.toFixed(6));
    url.searchParams.set('maxLat', boundingBox.maxLat.toFixed(6));
    url.searchParams.set('maxLng', boundingBox.maxLng.toFixed(6));
  }

  appendSearchParams(url, extraParams || process.env.WIKILOC_MAP_PARAMS);

  const response = await fetch(url, {
    headers: {
      ...SESSION_HEADERS,
      Accept: 'application/json, text/plain, */*',
    },
  });

  if (!response.ok) {
    throw new Error(`Wikiloc respondió con ${response.status} en ${url.toString()}`);
  }

  const raw = await response.text();
  try {
    const json = JSON.parse(raw);
    return { json, raw };
  } catch (error) {
    return { json: null, raw };
  }
};

const fetchSearchHtml = async (query, activity) => {
  const act = activity ?? DEFAULT_ACTIVITY;
  const searchUrl = `${BASE_URL}/wikiloc/find.do?q=${encodeURIComponent(query)}${act ? `&act=${encodeURIComponent(act)}` : ''}`;
  const response = await fetch(searchUrl, {
    headers: {
      ...SESSION_HEADERS,
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Cache-Control': 'no-cache',
    },
  });
  if (!response.ok) {
    throw new Error(`Wikiloc respondió con ${response.status} para ${searchUrl}`);
  }
  return response.text();
};

const asAbsoluteUrl = (value) => {
  if (!value || typeof value !== 'string') {
    return null;
  }
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }
  if (value.startsWith('//')) {
    return `https:${value}`;
  }
  if (value.startsWith('/')) {
    return `${BASE_URL}${value}`;
  }
  return null;
};

const extractFirstTrailLinkFromJson = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const seen = new Set([payload]);
  const queue = [payload];
  const urlKeys = ['url', 'trailUrl', 'trailURL', 'permalink', 'link', 'href'];

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === null || current === undefined) {
      continue;
    }

    if (typeof current === 'string') {
      const absolute = asAbsoluteUrl(current.trim());
      if (absolute && /\/trail/i.test(absolute)) {
        return absolute;
      }
      continue;
    }

    if (Array.isArray(current)) {
      current.forEach((item) => {
        if (!seen.has(item)) {
          seen.add(item);
          queue.push(item);
        }
      });
      continue;
    }

    if (typeof current === 'object') {
      for (const key of urlKeys) {
        if (typeof current[key] === 'string') {
          const absolute = asAbsoluteUrl(current[key].trim());
          if (absolute && /\/trail/i.test(absolute)) {
            return absolute;
          }
        }
      }

      Object.values(current).forEach((next) => {
        if (!seen.has(next)) {
          seen.add(next);
          queue.push(next);
        }
      });
    }
  }

  return null;
};

const extractFirstTrailLink = (html) => {
  const $ = load(html);
  const candidates = [
    'a.trail-title',
    'a.trailTitle',
    'a.result-title',
    'a[href*="/canyoning-trails/"]',
    'a[href*="/trails/canyoning/"]',
    'a[href*="/trails/"]',
  ];

  for (const selector of candidates) {
    const anchor = $(selector).first();
    if (anchor && anchor.attr('href')) {
      let href = anchor.attr('href');
      if (!href.startsWith('http')) {
        href = `${BASE_URL}${href.startsWith('/') ? '' : '/'}${href}`;
      }
      return href;
    }
  }
  return null;
};

const enrichDataset = async ({ inputPath, outputPath, limit, delayMs, dryRun, radiusKm, extraMapParams, activity }) => {
  const absoluteInput = path.resolve(__dirname, '..', inputPath);
  const absoluteOutput = path.resolve(__dirname, '..', outputPath ?? inputPath);

  const rawContent = await fs.readFile(absoluteInput, 'utf-8');
  const dataset = JSON.parse(rawContent);

  let updatedCount = 0;
  let processed = 0;

  for (const item of dataset) {
    if (limit && processed >= limit) {
      break;
    }
    processed += 1;

    if (item.wikiloc_aproximacion || item.wikiloc_approach || item?.wikiloc?.approach) {
      continue;
    }

    const query = buildQuery(item);
    if (!query) {
      console.warn(`Sin texto de búsqueda para el barranco ID=${item.id ?? processed}`);
      continue;
    }

    try {
      console.log(`Buscando Wikiloc para "${query}"...`);

      let link = null;
      let source = null;

      if (USE_MAP_ENDPOINT) {
        try {
          const { json } = await fetchMapResults({
            query,
            coordinates: item.coordinates,
            radiusKm: radiusKm ?? item?.coordinates?.radiusKm ?? DEFAULT_RADIUS_KM,
            extraParams: extraMapParams,
            activity,
          });
          if (json) {
            link = extractFirstTrailLinkFromJson(json);
            source = link ? 'map' : null;
          }
        } catch (error) {
          console.warn(`Fallo en endpoint JSON para "${query}": ${error.message}`);
        }
      }

      if (!link) {
  const html = await fetchSearchHtml(query, activity);
        link = extractFirstTrailLink(html);
        source = link ? 'html' : null;
      }

      if (!link) {
        console.warn(`No se encontró enlace para "${query}"`);
      } else {
        console.log(` → ${link} (${source ?? 'desconocido'})`);
        if (!dryRun) {
          item.wikiloc_aproximacion = link;
          updatedCount += 1;
        }
      }
    } catch (error) {
      console.error(`Error al consultar "${query}":`, error.message);
    }

    if (delayMs > 0 && processed < dataset.length) {
      await sleep(delayMs);
    }
  }

  if (dryRun) {
    console.log(`Modo simulación: no se guardaron cambios (se habrían actualizado ${updatedCount} registros).`);
    return;
  }

  await fs.writeFile(absoluteOutput, `${JSON.stringify(dataset, null, 2)}\n`, 'utf-8');
  console.log(`Actualización completada. Registros modificados: ${updatedCount}. Archivo guardado en ${absoluteOutput}`);
};

const main = async () => {
  const options = parseArgs(process.argv);
  const inputPath = options.input ?? DEFAULT_INPUT;
  const outputPath = options.output ?? inputPath;
  const limit = parseOptionalNumber(options.limit);
  const delayMs = parseOptionalNumber(options.delay) ?? DEFAULT_DELAY_MS;
  const dryRun = options['dry-run'] === 'true' || options['dry'] === 'true';
  const radiusKm = parseOptionalNumber(options.radius);
  const extraMapParams = options.mapParams ?? options['map-params'] ?? undefined;
  const activity = options.activity ?? options.act ?? DEFAULT_ACTIVITY;

  await enrichDataset({ inputPath, outputPath, limit, delayMs, dryRun, radiusKm, extraMapParams, activity });
};

main().catch((error) => {
  console.error('La ejecución terminó con errores:', error);
  process.exitCode = 1;
});
