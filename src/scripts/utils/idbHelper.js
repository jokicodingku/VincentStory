import { openDB } from 'idb';

const DB_NAME = 'Storigram';
const DB_VERSION = 1;
const STORE_NAME = 'saved-stories';

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    }
  }
});

export const idbHelper = {
  async saveStory(story) {
    const db = await dbPromise;
    return db.put(STORE_NAME, story);
  },
  async getAllStories() {
    const db = await dbPromise;
    return db.getAll(STORE_NAME);
  },
  async deleteStory(id) {
    const db = await dbPromise;
    return db.delete(STORE_NAME, id);
  },
async getStory(id) {
  const db = await dbPromise;
  return db.get(STORE_NAME, id);
}

};
