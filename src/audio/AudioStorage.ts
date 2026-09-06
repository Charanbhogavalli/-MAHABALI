/**
 * IndexedDB storage for custom user uploaded background music tracks
 */

const DB_NAME = 'MahabaliAudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'custom_bgm';
const KEY_NAME = 'user_track';

export interface StoredAudioTrack {
  id: string;
  name: string;
  size: number;
  type: string;
  blob: Blob;
  duration?: number;
  uploadedAt: number;
}

export async function openAudioDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveCustomTrack(file: File): Promise<StoredAudioTrack> {
  const db = await openAudioDB();
  const track: StoredAudioTrack = {
    id: KEY_NAME,
    name: file.name,
    size: file.size,
    type: file.type,
    blob: file,
    uploadedAt: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(track);
    req.onsuccess = () => resolve(track);
    req.onerror = () => reject(req.error);
  });
}

export async function getCustomTrack(): Promise<StoredAudioTrack | null> {
  try {
    const db = await openAudioDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(KEY_NAME);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function removeCustomTrack(): Promise<void> {
  try {
    const db = await openAudioDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(KEY_NAME);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {}
}
