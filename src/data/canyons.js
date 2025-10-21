import descenteCanyons from './canyons_espana_descente_con_wikiloc.json';

const normalizeString = (value) => {
  if (typeof value !== 'string') {
    return undefined;
  }
  let normalized = value.replace(/\s+/g, ' ').trim();
  normalized = normalized.replace(/\)(?=[^\s])/g, ') ');
  normalized = normalized.replace(/([a-záéíóúñ])([A-ZÁÉÍÓÚÑ])/g, '$1 $2');
  normalized = normalized.replace(/([A-Za-zÁÉÍÓÚáéíóúñ])\(/g, '$1 (');
  normalized = normalized.replace(/\s{2,}/g, ' ').trim();
  return normalized;
};

const parseNullableNumber = (value) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

const extractMaxRappelMeters = (value) => {
  if (typeof value !== 'string') {
    return null;
  }
  const match = value.match(/(\d+[\.,]?\d*)\s*(?:m|metros?)/i);
  if (!match) {
    return null;
  }
  const parsed = Number.parseFloat(match[1].replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
};

const formatDifficulty = (value) => {
  if (typeof value !== 'string') {
    return 'Sin datos';
  }
  const normalized = normalizeString(value);
  if (!normalized) {
    return 'Sin datos';
  }
  if (normalized.toLowerCase() === 'sin datos') {
    return 'Sin datos';
  }

  const uppercased = normalized.toUpperCase();

  const extractComponent = (prefix) => {
    const pattern = new RegExp(`${prefix}\\s*([0-9]+(?:[.,][0-9]+)?)`, 'i');
    const match = pattern.exec(uppercased);
    if (!match) {
      return null;
    }
    const numericPart = match[1].replace(',', '.');
    return `${prefix}${numericPart}`;
  };

  const vertical = extractComponent('V');
  const aquatic = extractComponent('A');
  const components = [vertical, aquatic].filter(Boolean);

  if (components.length > 0) {
    return components.join(' ');
  }

  const withoutRomans = uppercased.replace(/\b[IVXLCDM]+\b/g, ' ').replace(/[()]/g, ' ');
  const cleaned = withoutRomans.replace(/\s{2,}/g, ' ').trim();
  return cleaned || 'Sin datos';
};

const extractDifficultyComponent = (value, prefix) => {
  if (typeof value !== 'string') {
    return null;
  }
  const normalized = value.toUpperCase().trim();
  if (normalized.startsWith(prefix)) {
    const digits = normalized.slice(1).replace(',', '.');
    if (digits.length === 0) {
      return null;
    }
    return `${prefix}${digits}`;
  }
  const pattern = new RegExp(`${prefix}(\d+(?:\.\d+)?)`, 'i');
  const match = pattern.exec(normalized);
  if (!match) {
    return null;
  }
  const numericPart = match[1].replace(',', '.');
  return `${prefix}${numericPart}`;
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isMeaningful = (value) => {
  const normalized = normalizeString(value);
  if (!normalized) {
    return false;
  }
  const placeholders = [
    'approche:',
    '-canyon.com',
    'à la fiche-canyon',
    'info técnica',
    'descripciones',
    'tiempo descenso:',
    'tiempo retorno:',
    'tiempo aproximacion:',
    'no hay topos por el momento',
    'no hay imagenes',
    'localidad:',
    'region :',
    'région :',
    'massif',
    '?',
  ];
  return !placeholders.includes(normalized.toLowerCase());
};

const getMeaningfulString = (value) => {
  const normalized = normalizeString(value);
  if (!normalized) {
    return null;
  }
  if (!isMeaningful(normalized)) {
    return null;
  }
  return normalized;
};

const collectLocationParts = (item) => {
  const candidates = [
    item.localidad,
    item.municipio,
    item.municipality,
    item.poblacion,
    item.city,
    item.provincia,
    item.departamento,
    item.department,
    item.province,
    item.region,
    item.región,
    item.zona,
  ];

  const expanded = [];
  candidates.forEach((candidate) => {
    const normalized = normalizeString(candidate);
    if (!normalized) {
      return;
    }
    if (!isMeaningful(normalized)) {
      return;
    }
    expanded.push(normalized);
    const simplified = normalized.replace(/^(provincia|departamento|region|región|comunidad|province|department|state|estado) de\s+/i, '');
    if (simplified && simplified !== normalized) {
      expanded.push(simplified);
    }
  });

  return Array.from(new Set(expanded));
};

const simplifyLocationLabel = (value) => {
  const meaningful = getMeaningfulString(value);
  if (!meaningful) {
    return null;
  }
  const simplified = meaningful.replace(/^(provincia|departamento|region|región|comunidad|province|department|state|estado) de\s+/i, '');
  return simplified || meaningful;
};

const stripLocationFromName = (name, item) => {
  if (!name) {
    return name;
  }
  let cleaned = name;
  const parts = collectLocationParts(item);
  parts.forEach((part) => {
    const escaped = escapeRegExp(part);
    const trailingWithParen = new RegExp(`\\s+${escaped}\\s*\\(.*\\)$`, 'i');
    cleaned = cleaned.replace(trailingWithParen, '').trim();
    const withParen = new RegExp(`\\s*\\(\\s*${escaped}\\s*\\)$`, 'i');
    cleaned = cleaned.replace(withParen, '').trim();
    const simpleTrailing = new RegExp(`\\s+${escaped}$`, 'i');
    cleaned = cleaned.replace(simpleTrailing, '').trim();
  });
  cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
  return cleaned || name;
};

const buildSummary = (item) => {
  const parts = [];
  const rappel = normalizeString(item.rappel_mas_largo) ?? normalizeString(item.rapel_maximo);
  const desnivel = normalizeString(item.desnivel_acumulado);
  const tiempoBarranco = normalizeString(item.tiempo_aproximado_barranco) ?? normalizeString(item.tiempo_descenso);
  const tiempoAproximacion = normalizeString(item.tiempo_aproximado_aproximacion) ?? normalizeString(item.tiempo_aproximacion);
  const tiempoRetorno = normalizeString(item.tiempo_aproximado_retorno) ?? normalizeString(item.tiempo_retorno);

  if (isMeaningful(rappel)) {
    parts.push(`Rappel máx: ${rappel}`);
  }
  if (isMeaningful(desnivel)) {
    parts.push(`Desnivel: ${desnivel}`);
  }
  if (isMeaningful(tiempoAproximacion)) {
    parts.push(`Aproximación: ${tiempoAproximacion}`);
  }
  if (isMeaningful(tiempoBarranco)) {
    parts.push(`Descenso: ${tiempoBarranco}`);
  }
  if (isMeaningful(tiempoRetorno)) {
    parts.push(`Retorno: ${tiempoRetorno}`);
  }
  return parts.length > 0 ? parts.join(' · ') : 'Datos pendientes de revisión.';
};

const deriveIdFromUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return undefined;
  }
  try {
    const { pathname } = new URL(url);
    const segment = pathname.split('/').filter(Boolean).pop();
    return normalizeString(segment);
  } catch (error) {
    return normalizeString(url);
  }
};

const combineSources = descenteCanyons.map((item) => ({ ...item, __source: 'descente' }));

const normalizedCanyons = combineSources
  .filter(Boolean)
  .map((item, index) => {
    const normalizedId = normalizeString(item.id) ?? deriveIdFromUrl(item.url);
    const id = normalizedId ?? `canyon-${index}`;
    const baseName = normalizeString(item.name) ?? normalizeString(item.nombre);
    const name = stripLocationFromName(baseName, item) || baseName || 'Barranco sin nombre';
    const difficultyCandidates = [item.difficulty, item.grado_VA, item.dificultad];
    const rawDifficulty = difficultyCandidates.find((candidate) => typeof candidate === 'string' && normalizeString(candidate));
    const difficulty = formatDifficulty(rawDifficulty ?? 'Sin datos');
    const rawVerticalField = normalizeString(item.dificultad_vertical) ?? normalizeString(item.difficulty_vertical);
    const rawAquaticField = normalizeString(item.dificultad_acuatica) ?? normalizeString(item.difficulty_aquatic);
    const difficultyVertical =
      extractDifficultyComponent(rawVerticalField, 'V') ?? extractDifficultyComponent(difficulty, 'V');
    const difficultyAquatic =
      extractDifficultyComponent(rawAquaticField, 'A') ?? extractDifficultyComponent(difficulty, 'A');
    const description =
      normalizeString(item.description) ??
      normalizeString(item.resumen) ??
      normalizeString(item.descripcion) ??
      normalizeString(item.descripcion_corta) ??
      '';
    const summary = normalizeString(item.summary) ?? buildSummary(item);

    const locality = getMeaningfulString(item.localidad) ?? getMeaningfulString(item.municipio) ?? getMeaningfulString(item.municipality);
    const province =
      simplifyLocationLabel(item.provincia) ??
      simplifyLocationLabel(item.departamento) ??
      simplifyLocationLabel(item.department) ??
      simplifyLocationLabel(item.province);
    const region =
      simplifyLocationLabel(item.region) ??
      simplifyLocationLabel(item.región) ??
      simplifyLocationLabel(item.zona);
    const country = simplifyLocationLabel(item.pais) ?? simplifyLocationLabel(item.country);
    const locationSegments = Array.from(new Set([locality, province, region].filter(Boolean)));
    const locationText = locationSegments.length > 0 ? locationSegments.join(', ') : null;

    let gear = [];
    if (Array.isArray(item.gear)) {
      gear = item.gear.filter(Boolean).map((value) => normalizeString(value)).filter(Boolean);
    } else if (typeof item.material === 'string') {
      gear = item.material
        .split(/,|\n|·|;/)
        .map((value) => normalizeString(value))
        .filter(Boolean);
    } else if (typeof item.material_recomendado === 'string') {
      gear = item.material_recomendado
        .split(/,|\n|·|;/)
        .map((value) => normalizeString(value))
        .filter(Boolean);
    }

    const rappelMeters =
      extractMaxRappelMeters(item.rappel_mas_largo) ?? extractMaxRappelMeters(item.rapel_maximo);
    if (rappelMeters !== null) {
      const ropeText = `2 cuerdas de ${rappelMeters % 1 === 0 ? rappelMeters : Number.parseFloat(rappelMeters.toFixed(1))} m`;
      if (!gear.some((entry) => entry && entry.toLowerCase() === ropeText.toLowerCase())) {
        gear.push(ropeText);
      }
    }

    const cleanedCoordinates = (() => {
      if (!item.coordinates || typeof item.coordinates !== 'object') {
        return null;
      }
      const lat = parseNullableNumber(item.coordinates.lat);
      const lng = parseNullableNumber(item.coordinates.lng);
      if (lat === null || lng === null) {
        return null;
      }
      const zoom = parseNullableNumber(item.coordinates.zoom) ?? 13;
      return { lat, lng, zoom };
    })();

    const wikilocApproach =
      item?.wikiloc?.approach ??
      item?.wikiloc_aproximacion ??
      item?.wikiloc_approach ??
      item?.enlace_aproximacion ??
      null;
    const wikilocReturn =
      item?.wikiloc?.return ??
      item?.wikiloc_retorno ??
      item?.wikiloc_return ??
      item?.enlace_retorno ??
      null;

    const wikilocSearchUrl = typeof item.wikiloc_search_url === 'string' ? item.wikiloc_search_url.trim() : null;

    const ratingAverageRaw = parseNullableNumber(item.rating_average ?? item.ratingAverage);
    const ratingVotesRaw = parseNullableNumber(item.rating_votes ?? item.ratingVotes);
    const ratingVotes = ratingVotesRaw !== null ? Math.max(0, Math.round(ratingVotesRaw)) : 0;
    const ratingAverage = ratingAverageRaw !== null ? Number.parseFloat(ratingAverageRaw.toFixed(2)) : null;

    return {
      ...item,
      id,
      name,
      difficulty,
      difficultyVertical,
      difficultyAquatic,
      description: description || summary,
      summary,
      gear,
      maxRappelMeters: rappelMeters,
      ratingAverage,
      ratingVotes,
      wikiloc: {
        approach: normalizeString(wikilocApproach) ?? null,
        return: normalizeString(wikilocReturn) ?? null,
      },
      wikiloc_search_url: wikilocSearchUrl,
      coordinates: cleanedCoordinates,
      location: {
        locality: locality ?? null,
        province: province ?? null,
        region: region ?? null,
        country: country ?? null,
        text: locationText,
      },
    };
  });

const isBetterString = (current, candidate) => {
  if (!candidate) {
    return current;
  }
  if (!current) {
    return candidate;
  }
  const normalizedCurrent = normalizeString(current);
  const normalizedCandidate = normalizeString(candidate);
  if (!normalizedCurrent) {
    return candidate;
  }
  if (!normalizedCandidate) {
    return current;
  }
  if (normalizedCurrent === normalizedCandidate) {
    return current;
  }
  if (!isMeaningful(normalizedCurrent) && isMeaningful(normalizedCandidate)) {
    return candidate;
  }
  if (normalizedCandidate.length > normalizedCurrent.length) {
    return candidate;
  }
  return current;
};

const mergeCanyons = (first, second) => {
  const mergeLocation = (a = {}, b = {}) => {
    const locality = isBetterString(a.locality, b.locality);
    const province = isBetterString(a.province, b.province);
    const region = isBetterString(a.region, b.region);
    const country = isBetterString(a.country, b.country);
    const locationSegments = Array.from(new Set([locality, province, region].filter(Boolean)));
    const text = locationSegments.length > 0 ? locationSegments.join(', ') : null;
    return {
      locality: locality ?? a.locality ?? b.locality ?? null,
      province: province ?? a.province ?? b.province ?? null,
      region: region ?? a.region ?? b.region ?? null,
      country: country ?? a.country ?? b.country ?? null,
      text,
    };
  };

  const mergeRating = () => {
    const firstVotes = typeof first.ratingVotes === 'number' ? first.ratingVotes : 0;
    const secondVotes = typeof second.ratingVotes === 'number' ? second.ratingVotes : 0;
    const firstAverage = typeof first.ratingAverage === 'number' ? first.ratingAverage : null;
    const secondAverage = typeof second.ratingAverage === 'number' ? second.ratingAverage : null;
    const totalVotes = firstVotes + secondVotes;
    if (totalVotes === 0) {
      return {
        ratingAverage: firstAverage ?? secondAverage ?? null,
        ratingVotes: 0,
      };
    }
    const totalScore = (firstAverage ?? 0) * firstVotes + (secondAverage ?? 0) * secondVotes;
    return {
      ratingAverage: Number.parseFloat((totalScore / totalVotes).toFixed(2)),
      ratingVotes: totalVotes,
    };
  };

  const mergedDifficulty = formatDifficulty(isBetterString(first.difficulty, second.difficulty));
  const mergedRating = mergeRating();

  return {
    ...first,
    ...second,
    description: isBetterString(first.description, second.description),
    summary: isBetterString(first.summary, second.summary),
    difficulty: mergedDifficulty,
    difficultyVertical:
      extractDifficultyComponent(isBetterString(first.difficultyVertical, second.difficultyVertical), 'V') ??
      extractDifficultyComponent(mergedDifficulty, 'V') ??
      first.difficultyVertical ??
      second.difficultyVertical ??
      null,
    difficultyAquatic:
      extractDifficultyComponent(isBetterString(first.difficultyAquatic, second.difficultyAquatic), 'A') ??
      extractDifficultyComponent(mergedDifficulty, 'A') ??
      first.difficultyAquatic ??
      second.difficultyAquatic ??
      null,
    maxRappelMeters: (() => {
      const asNumber = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : null);
      const secondValue = asNumber(second.maxRappelMeters);
      const firstValue = asNumber(first.maxRappelMeters);
      return secondValue ?? firstValue ?? null;
    })(),
    ratingAverage: mergedRating.ratingAverage,
    ratingVotes: mergedRating.ratingVotes,
    gear: first.gear.length >= second.gear.length ? first.gear : second.gear,
    wikiloc: {
      approach: second.wikiloc?.approach ?? first.wikiloc?.approach ?? null,
      return: second.wikiloc?.return ?? first.wikiloc?.return ?? null,
    },
    coordinates: second.coordinates ?? first.coordinates ?? null,
    location: mergeLocation(first.location, second.location),
  };
};

const dedupedById = new Map();
normalizedCanyons.forEach((canyon) => {
  const existing = dedupedById.get(canyon.id);
  if (!existing) {
    dedupedById.set(canyon.id, canyon);
  } else {
    dedupedById.set(canyon.id, mergeCanyons(existing, canyon));
  }
});

const mergedList = Array.from(dedupedById.values()).sort((a, b) => {
  return (a.name || '').localeCompare(b.name || '', 'es', { sensitivity: 'base' });
});

export default mergedList;
