#!/usr/bin/env node
// Añade una URL de búsqueda de Wikiloc a cada barranco.
// Genera un archivo nuevo para no sobrescribir los datos originales.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_FILE = process.env.SOURCE || 'src/data/canyons_espana_descente_corregido.json';
const OUTPUT_FILE = process.env.OUTPUT || 'src/data/canyons_espana_descente_con_wikiloc.json';
const DEFAULT_ACTIVITY = process.env.WIKILOC_ACTIVITY || '46';

const resolvePath = (relativePath) => path.resolve(__dirname, '..', relativePath);

const loadDataset = async (filePath) => {
  const absolutePath = resolvePath(filePath);
  const content = await fs.readFile(absolutePath, 'utf8');
  return { absolutePath, data: JSON.parse(content) };
};

const buildSearchUrl = (name, province, activity) => {
  const parts = [name, province].filter(Boolean).join(' ');
  const query = encodeURIComponent(parts);
  const activityParam = activity ? `&act=${encodeURIComponent(activity)}` : '';
  return `https://www.wikiloc.com/wikiloc/find.do?q=${query}${activityParam}`;
};

const addSearchUrls = (dataset, activity) => {
  return dataset.map((item) => {
    const { nombre, provincia } = item;
    const searchUrl = buildSearchUrl(nombre, provincia, activity);
    return {
      ...item,
      wikiloc_search_url: searchUrl,
    };
  });
};

const saveDataset = async (filePath, data) => {
  const absolutePath = resolvePath(filePath);
  const json = JSON.stringify(data, null, 2);
  await fs.writeFile(absolutePath, `${json}\n`, 'utf8');
  return absolutePath;
};

const main = async () => {
  const { data } = await loadDataset(SOURCE_FILE);
  if (!Array.isArray(data)) {
    throw new Error('El archivo de entrada no contiene un array JSON.');
  }

  const enriched = addSearchUrls(data, DEFAULT_ACTIVITY);
  const outputPath = await saveDataset(OUTPUT_FILE, enriched);
  console.log(`✅ Archivo actualizado con enlaces de búsqueda de Wikiloc: ${outputPath}`);
};

main().catch((error) => {
  console.error('❌ Error al generar enlaces de Wikiloc:', error.message);
  process.exitCode = 1;
});
