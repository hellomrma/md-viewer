import { promises as fs } from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

const MANIFEST_FILE = "manifest.json";
const HEAD_BYTES = 8 * 1024;

export interface DocEntry {
  file: string;
  title: string;
  sizeKB: number;
}

export interface Manifest {
  version: 1;
  generatedAt: string;
  docs: DocEntry[];
}

export function extractTitle(headContent: string, fileName: string): string {
  const lines = headContent.split(/\r?\n/);
  let inFence = false;
  let fenceChar: "`" | "~" | null = null;

  for (const line of lines) {
    const fence = line.match(/^(`{3,}|~{3,})/);
    if (fence) {
      const ch = fence[1][0] as "`" | "~";
      if (!inFence) {
        inFence = true;
        fenceChar = ch;
      } else if (ch === fenceChar) {
        inFence = false;
        fenceChar = null;
      }
      continue;
    }
    if (inFence) continue;

    const h1 = line.match(/^# +(.+?)\s*$/);
    if (h1) return h1[1].trim();
  }

  const base = fileName.replace(/\.(md|markdown)$/i, "");
  const cleaned = base.replace(/[-_]+/g, " ").trim();
  if (!cleaned) return base;
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export async function buildManifest(docsAbsDir: string): Promise<Manifest> {
  const generatedAt = new Date().toISOString();

  let entries: string[];
  try {
    entries = await fs.readdir(docsAbsDir);
  } catch {
    return { version: 1, generatedAt, docs: [] };
  }

  const candidates = entries.filter(
    (n) => /\.(md|markdown)$/i.test(n) && n !== MANIFEST_FILE,
  );

  const docs: DocEntry[] = [];
  for (const fileName of candidates) {
    const abs = path.join(docsAbsDir, fileName);
    const stat = await fs.stat(abs);
    if (!stat.isFile()) continue;

    const fh = await fs.open(abs, "r");
    try {
      const len = Math.min(HEAD_BYTES, stat.size);
      const buf = Buffer.alloc(len);
      if (len > 0) await fh.read(buf, 0, len, 0);
      const head = buf.toString("utf8");
      const title = extractTitle(head, fileName);
      const sizeKB = Math.max(1, Math.round(stat.size / 1024));
      docs.push({ file: fileName, title, sizeKB });
    } finally {
      await fh.close();
    }
  }

  docs.sort((a, b) => a.file.localeCompare(b.file, "ko"));
  return { version: 1, generatedAt, docs };
}

const DOCS_DIR_REL = path.join("public", "docs");
const DEBOUNCE_MS = 150;

export async function writeManifest(docsAbsDir: string): Promise<void> {
  const manifest = await buildManifest(docsAbsDir);
  await fs.mkdir(docsAbsDir, { recursive: true });
  const manifestPath = path.join(docsAbsDir, MANIFEST_FILE);
  await fs.writeFile(
    manifestPath,
    JSON.stringify(manifest, null, 2) + "\n",
    "utf8",
  );
}

export function docsManifest(): Plugin {
  let docsAbsDir = "";
  let timer: NodeJS.Timeout | null = null;

  function scheduleWrite(after?: () => void) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      timer = null;
      try {
        await writeManifest(docsAbsDir);
        after?.();
      } catch (err) {
        console.error("[vite-plugin-docs-manifest] write failed:", err);
      }
    }, DEBOUNCE_MS);
  }

  return {
    name: "vite-plugin-docs-manifest",

    configResolved(config) {
      docsAbsDir = path.resolve(config.root, DOCS_DIR_REL);
    },

    async buildStart() {
      await writeManifest(docsAbsDir);
    },

    configureServer(server) {
      server.watcher.add(docsAbsDir);
      const onChange = (changedPath: string) => {
        if (!changedPath.startsWith(docsAbsDir)) return;
        if (path.basename(changedPath) === MANIFEST_FILE) return;
        scheduleWrite(() => server.ws.send({ type: "full-reload" }));
      };
      server.watcher.on("add", onChange);
      server.watcher.on("change", onChange);
      server.watcher.on("unlink", onChange);
    },
  };
}
