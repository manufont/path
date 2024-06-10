import { useEffect, useState, useMemo } from "react";

type Response = any;

const promiseCache: { [url: string]: Promise<Response> | Response | undefined } = {};

const noop = <T>(_: Response) => _ as unknown as T;

const defaultFetcher = async <T>(url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw Error(String(response.status));
  return (await response.json()) as T;
};

type Fetcher = (url: string) => Promise<any>;

type Parser<T> = (response: Response) => T;

const isFetched = (
  url: string | null,
  entry: Response | Promise<Response> | undefined,
): entry is Response => {
  if (url === null) return false;
  return Boolean(promiseCache[url] && !(promiseCache[url] instanceof Promise));
};

const useResource = <T>(
  url: string | null,
  parseResult: Parser<T> = noop,
  fetcher: Fetcher = defaultFetcher,
): [resource: T | null, loading: boolean, error: unknown] => {
  const fetched = isFetched(url, url ? promiseCache[url] : undefined);
  const [error, setError] = useState<unknown | null>(null);
  const [, setDateFetched] = useState<number | null>(null);

  const resource = useMemo(() => {
    if (url === null || !fetched) return null;
    return parseResult(promiseCache[url] as Response);
  }, [fetched, url, parseResult]);

  useEffect(() => {
    if (url === null) return;
    const cached = promiseCache[url];
    if (cached && !(cached instanceof Promise)) return;
    if (cached === undefined) {
      promiseCache[url] = fetcher(url);
    }
    (promiseCache[url] as Promise<Response>)
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

export const clearResourceCache = (url: string) => {
  delete promiseCache[url];
};

export const addCacheEntry = (url: string, results: Response) => {
  promiseCache[url] = results;
};

export default useResource;
