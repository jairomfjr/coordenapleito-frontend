/** Cache temporário de PDFs para visualização HTTP no Chrome (nome correto ao salvar). */

const TTL_MS = 10 * 60 * 1000;

type Entry = {
  body: ArrayBuffer;
  filename: string;
  expires: number;
};

function store(): Map<string, Entry> {
  const g = globalThis as typeof globalThis & { __relatorioPdfViewStore?: Map<string, Entry> };
  if (!g.__relatorioPdfViewStore) {
    g.__relatorioPdfViewStore = new Map();
  }
  return g.__relatorioPdfViewStore;
}

function purgeExpired(map: Map<string, Entry>): void {
  const now = Date.now();
  for (const [id, entry] of map) {
    if (entry.expires <= now) {
      map.delete(id);
    }
  }
}

export function putRelatorioPdfView(body: ArrayBuffer, filename: string): string {
  const map = store();
  purgeExpired(map);
  const id = crypto.randomUUID();
  map.set(id, { body: body.slice(0), filename, expires: Date.now() + TTL_MS });
  return id;
}

export function getRelatorioPdfView(id: string): Entry | null {
  const map = store();
  const entry = map.get(id);
  if (!entry || entry.expires <= Date.now()) {
    map.delete(id);
    return null;
  }
  return entry;
}

export function deleteRelatorioPdfView(id: string): void {
  store().delete(id);
}
