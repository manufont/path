import { Path } from "hooks/usePath";
import { IDBPDatabase } from "idb";
import { createContext, PropsWithChildren, useEffect, useState } from "react";
import dbPromise from "./db";
import { getSvgPath } from "./utils";

export type StoredPath = Path & {
  svgPath: string;
  dateAdded: string;
  id: string;
  pathSearch: string;
};

type Library = {
  loading: boolean;
  storedPaths: StoredPath[];
  addPath: (path: Path) => Promise<void>;
  deletePath: (pathId: StoredPath["id"]) => Promise<void>;
};

const defaultState: Library = {
  loading: true,
  storedPaths: [],
  addPath: async (path: Path) => {},
  deletePath: async (pathId: StoredPath["id"]) => {},
};

const LibraryContext = createContext(defaultState);

const LibraryProvider = ({ children }: PropsWithChildren) => {
  const [loading, setLoading] = useState(true);
  const [storedPaths, setStoredPaths] = useState<StoredPath[]>([]);
  const [db, setDB] = useState<IDBPDatabase | undefined>();

  useEffect(() => {
    dbPromise.then(setDB);
  }, []);

  useEffect(() => {
    if (!db) return;
    db.getAll("paths").then((storedPaths) => {
      setStoredPaths(storedPaths);
      setLoading(false);
    });
  }, [db]);

  const addPath = async (path: Path) => {
    if (!db) return;
    const svgPath = getSvgPath(path);
    const dateAdded = new Date().toISOString();
    const storedPath = {
      ...path,
      svgPath,
      dateAdded,
      pathSearch: document.location.search, // this works because the added path is always the current one
    };
    await db.put("paths", storedPath);
    setStoredPaths([...storedPaths.filter((_) => _.id !== path.id), storedPath]);
  };

  const deletePath = async (pathId: string) => {
    if (!db) return;
    await db.delete("paths", pathId);
    setStoredPaths(storedPaths.filter((_) => _.id !== pathId));
  };

  return (
    <LibraryContext.Provider
      value={{
        loading,
        storedPaths,
        addPath,
        deletePath,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export { LibraryProvider, LibraryContext };
