import { useEffect, useState, useMemo } from "react";

const promiseCache = {};

const noop = (_) => _;

const defaultFetcher = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw Error(response.status);
  return await response.json();
};

const useResource = (url, parseResult = noop, fetcher = defaultFetcher) => {
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
      promiseCache[url] = fetcher(url);
    }
    promiseCache[url]
      .then((results) => {
        promiseCache[url] = results;
        setDateFetched(Date.now());
        setError(null);
      })
      .catch((error) => {
        delete promiseCache[url];
        console.error(error);
        setError(error);
      });
  }, [url, parseResult, fetcher]);

  const loading = url !== null && !fetched && !error;

  return [resource, loading, resource ? null : error];
};

export const clearResourceCache = (url) => {
  delete promiseCache[url];
};

export const addCacheEntry = (url, results) => {
  promiseCache[url] = results;
};

export default useResource;
