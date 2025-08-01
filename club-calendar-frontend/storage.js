/**
 * DOCSTRING: storage.js
 * Handles event persistence
 * - LocalStorage for metadata
 * - IndexedDB for file storage (blobs)
 */

export const Storage = {
  events: [],
  db: null,

  async init() {
    await this.initDB();
    this.loadFromLocal();
  },

  async initDB() {
    return new Promise((resolve) => {
      const request = indexedDB.open("ClubCalendarDB", 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files');
        }
      };
      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve();
      };
    });
  },

  loadFromLocal() {
    const stored = localStorage.getItem('clubEvents');
    this.events = stored ? JSON.parse(stored) : [];
  },

  saveToLocal() {
    localStorage.setItem('clubEvents', JSON.stringify(this.events));
  },

  async saveFile(file) {
    return new Promise((resolve) => {
      const tx = this.db.transaction('files', 'readwrite');
      const store = tx.objectStore('files');
      const putReq = store.put(file, file.name);
      putReq.onsuccess = () => resolve(file.name);
    });
  },

  async getFile(name) {
    return new Promise((resolve) => {
      const tx = this.db.transaction('files', 'readonly');
      const store = tx.objectStore('files');
      const getReq = store.get(name);
      getReq.onsuccess = () => resolve(getReq.result);
    });
  },

  addEvent(event) {
    this.events.push(event);
    this.saveToLocal();
  }
};
