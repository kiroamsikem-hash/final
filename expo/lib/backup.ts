import { Civilization, PeriodEvent, CellData } from "@/types";
import { articleStorage } from "./articleStorage";

async function blobToBase64(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunkSize)) as any
    );
  }
  if (typeof btoa !== "undefined") return btoa(binary);
  // Fallback (RN): not expected on web path
  return binary;
}

async function fetchDb<T>(action: string): Promise<T[]> {
  try {
    const resp = await fetch("/api/postgres", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const json = await resp.json();
    if (json?.success && Array.isArray(json.data)) return json.data as T[];
    return [];
  } catch {
    return [];
  }
}

export interface BackupResult {
  ok: boolean;
  message: string;
  to?: string;
  totalArticles?: number;
  attachedArticles?: number;
}

export async function sendBackupEmailFromClient(): Promise<BackupResult> {
  const civs = await fetchDb<Civilization>("getCivilizations");
  const events = await fetchDb<PeriodEvent>("getEvents");
  const cells = await fetchDb<CellData>("getCellData");

  let articlesMeta: any[] = [];
  let articleFiles: { filename: string; base64: string; size: number }[] = [];
  try {
    const all = await articleStorage.exportAllWithBlobs();
    articlesMeta = all.map((a) => ({
      ...a.meta,
      // Note: blob stored separately in articleFiles
    }));

    // Cap individual files at 8MB and total at ~25MB to fit Resend's limit
    const PER_FILE_MAX = 8 * 1024 * 1024;
    const TOTAL_MAX = 25 * 1024 * 1024;
    let total = 0;
    for (const a of all) {
      if (a.blob.size > PER_FILE_MAX) continue;
      if (total + a.blob.size > TOTAL_MAX) continue;
      const b64 = await blobToBase64(a.blob);
      const safeName = `${a.meta.civilizationId}__${a.meta.category}__${a.meta.name}`.replace(
        /[\\/:*?"<>|]+/g,
        "_"
      );
      articleFiles.push({ filename: safeName, base64: b64, size: a.blob.size });
      total += a.blob.size;
    }
  } catch (err) {
    console.warn("[backup] article export failed", err);
  }

  const payload = {
    version: 1,
    source: "client-manual",
    timestamp: new Date().toISOString(),
    civilizations: civs,
    events,
    cellData: cells,
    articles: articlesMeta,
  };

  const resp = await fetch("/api/backup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ payload, articleFiles }),
  });
  let json: any = null;
  try {
    json = await resp.json();
  } catch {
    json = null;
  }
  if (!resp.ok || !json?.success) {
    return {
      ok: false,
      message: json?.error || `HTTP ${resp.status}`,
    };
  }
  return {
    ok: true,
    message: "Yedek e-posta ile gönderildi.",
    to: json.to,
    totalArticles: articlesMeta.length,
    attachedArticles: articleFiles.length,
  };
}
