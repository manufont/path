import { openDB } from "idb";

const DB_NAME = "Library";

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db, oldVersion, newVersion, transaction, event) {
    db.createObjectStore("paths", {
      keyPath: "id",
    });
  },
  blocked(currentVersion, blockedVersion, event) {
    // …
  },
  blocking(currentVersion, blockedVersion, event) {
    // …
  },
  terminated() {
    // …
  },
});

export default dbPromise;
