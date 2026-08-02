const STORAGE_KEY = 'quickcrawl:recent-urls';
const MAX_HISTORY = 6;

function readRaw(): string[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
}

export function loadRecentUrls(): string[] {
  return readRaw().slice(0, MAX_HISTORY);
}

export function rememberUrl(url: string): string[] {
  const trimmed = url.trim();
  if (trimmed === '') return loadRecentUrls();

  const next = [trimmed, ...readRaw().filter((item) => item !== trimmed)].slice(
    0,
    MAX_HISTORY,
  );

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore quota / private-mode failures.
  }

  return next;
}
