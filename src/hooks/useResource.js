import { useEffect, useState, useMemo } from "react";

const promiseCache = {};

const noop = (_) => _;

const useResource = (url, parseResult = noop) => {
  const fetched = url !== null && Boolean(promiseCache[url] && !promiseCache[url].then);
  const [error, setError] = useState(null);
  const [, setDateFetched] = useState(null);

  const resource = useMemo(() => {
    if (url === null || !fetched) return null;
    return parseResult(promiseCache[url]);
  }, [fetched, url, parseResult]);

  useEffect(() => {
    if (url === null) return;
    const cached = promiseCache[url];
    if (cached && !cached.then) return;
    if (cached === undefined) {
      promiseCache[url] = fetch(url).then((_) => _.json());
    }
    promiseCache[url]
      .then((results) => {
        promiseCache[url] = results;
        setDateFetched(Date.now());
      })
      .catch((error) => {
        delete promiseCache[url];
        console.error(error);
        setError(error);
      });
  }, [url, parseResult]);

  return [resource, url !== null && !fetched, error];
};

export const clearResourceCache = (url) => {
  delete promiseCache[url];
};

export const addCacheEntry = (url, results) => {
  promiseCache[url] = results;
};

export default useResource;
