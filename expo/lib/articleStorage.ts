// IndexedDB-based storage for civilization "Depo" articles.
// Designed to handle very large files (GB scale) on web; binary blobs are
// stored directly in IndexedDB so the data never has to fit in memory all at once.

import { Platform } from "react-native";

export interface ArticleRecord {
  id: string;
  civilizationId: string;
  name: string;
  category: string;
  size: number;
  type: string;
  uploadedAt: number;
  // The blob is stored alongside metadata. Reads are streamed by the browser
  // when downloading, so memory pressure stays low.
  blob: Blob;
}

export interface ArticleMeta {
  id: string;
  civilizationId: string;
  name: string;
  category: string;
  size: number;
  type: string;
  uploadedAt: number;
}

const DB_NAME = "anatolia-depo";
const DB_VERSION = 1;
const STORE = "articles";

function isWeb(): boolean {
  return Platform.OS === "web" && typeof indexedDB !== "undefined";
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isWeb()) {
      reject(new Error("IndexedDB is only available on web."));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const os = db.createObjectStore(STORE, { keyPath: "id" });
        os.createIndex("byCiv", "civilizationId", { unique: false });
        os.createIndex("byCivCategory", ["civilizationId", "category"], { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function toMeta(rec: ArticleRecord): ArticleMeta {
  const { blob: _b, ...meta } = rec;
  return meta;
}

export const articleStorage = {
  isAvailable(): boolean {
    return isWeb();
  },

  async listAll(): Promise<ArticleMeta[]> {
    if (!isWeb()) return [];
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => {
        const result = (req.result as ArticleRecord[]).map(toMeta);
        resolve(result);
      };
      req.onerror = () => reject(req.error);
    });
  },

  async exportAllWithBlobs(): Promise<{ meta: ArticleMeta; blob: Blob }[]> {
    if (!isWeb()) return [];
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = () => {
        const recs = (req.result as ArticleRecord[]) || [];
        resolve(recs.map((r) => ({ meta: toMeta(r), blob: r.blob })));
      };
      req.onerror = () => reject(req.error);
    });
  },

  async listByCivilization(civilizationId: string): Promise<ArticleMeta[]> {
    if (!isWeb()) return [];
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const idx = tx.objectStore(STORE).index("byCiv");
      const req = idx.getAll(IDBKeyRange.only(civilizationId));
      req.onsuccess = () => {
        const result = (req.result as ArticleRecord[]).map(toMeta);
        resolve(result);
      };
      req.onerror = () => reject(req.error);
    });
  },

  async add(params: {
    civilizationId: string;
    name: string;
    category: string;
    file: File | Blob;
    type?: string;
  }): Promise<ArticleMeta> {
    if (!isWeb()) throw new Error("Depo yalnizca web tarayicida calisir.");
    const db = await openDB();
    const record: ArticleRecord = {
      id: `art-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      civilizationId: params.civilizationId,
      name: params.name,
      category: (params.category || "Genel").trim() || "Genel",
      size: (params.file as Blob).size,
      type: params.type || (params.file as File).type || "application/octet-stream",
      uploadedAt: Date.now(),
      blob: params.file as Blob,
    };
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).add(record);
      tx.oncomplete = () => resolve(toMeta(record));
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  },

  async remove(id: string): Promise<void> {
    if (!isWeb()) return;
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async getBlob(id: string): Promise<{ meta: ArticleMeta; blob: Blob } | null> {
    if (!isWeb()) return null;
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(id);
      req.onsuccess = () => {
        const rec = req.result as ArticleRecord | undefined;
        if (!rec) {
          resolve(null);
          return;
        }
        resolve({ meta: toMeta(rec), blob: rec.blob });
      };
      req.onerror = () => reject(req.error);
    });
  },

  async updateMeta(
    id: string,
    patch: Partial<Pick<ArticleMeta, "name" | "category">>
  ): Promise<void> {
    if (!isWeb()) return;
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        const rec = getReq.result as ArticleRecord | undefined;
        if (!rec) {
          resolve();
          return;
        }
        const updated: ArticleRecord = {
          ...rec,
          name: patch.name?.trim() || rec.name,
          category: patch.category?.trim() || rec.category,
        };
        store.put(updated);
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  },

  async downloadToUser(id: string): Promise<void> {
    const data = await articleStorage.getBlob(id);
    if (!data) return;
    if (!isWeb()) return;
    const url = URL.createObjectURL(data.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = data.meta.name || "article";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  },
};

export function formatBytes(bytes: number): string {
  if (!bytes || bytes < 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let val = bytes;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i += 1;
  }
  return `${val.toFixed(val < 10 && i > 0 ? 2 : val < 100 && i > 0 ? 1 : 0)} ${units[i]}`;
}
