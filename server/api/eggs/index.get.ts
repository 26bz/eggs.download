import type { EggEntry } from '#shared/types/egg';

const toValues = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === 'string');
  }
  if (typeof value === 'string') {
    return [value];
  }
  return [];
};

const parseCsv = (value: unknown): string[] =>
  toValues(value)
    .flatMap((v) => v.split(','))
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

const parseOptionalBoolean = (value: unknown): boolean | null => {
  const normalized = (toValues(value)[0] || '').trim().toLowerCase();
  if (!normalized) return null;
  if (normalized === '1' || normalized === 'true') return true;
  if (normalized === '0' || normalized === 'false') return false;
  return null;
};

const pickFirst = (values: string[]): string | undefined => values[0];

const filterByField = (entries: EggEntry[], field: keyof EggEntry, value: unknown): EggEntry[] => {
  const wanted = new Set(parseCsv(value));
  if (!wanted.size) return entries;
  return entries.filter((entry) => wanted.has(String(entry[field]).toLowerCase()));
};

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  let entries = await getEggIndex();
  entries = filterByField(entries, 'source', query.source);
  entries = filterByField(entries, 'repo', query.repo);
  entries = filterByField(entries, 'category', query.category);
  entries = filterByField(entries, 'owner', query.owner);

  const fields = pickFirst(parseCsv(query.fields));
  const namesOnly =
    fields === 'name' || parseOptionalBoolean(query.namesOnly) || parseOptionalBoolean(query.names);
  if (!namesOnly) {
    return entries;
  }

  const unique = parseOptionalBoolean(query.unique) ?? true;
  const sort = parseOptionalBoolean(query.sort) ?? true;

  let names = entries.map((entry) => entry.name).filter(Boolean);
  if (unique) {
    names = [...new Set(names)];
  }
  if (sort) {
    names = names.toSorted((a, b) => a.localeCompare(b));
  }

  return names;
});
