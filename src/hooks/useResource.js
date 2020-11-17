import { useEffect, useState } from "react";

const promiseCache = {};

const noop = (_) => _;

const useResource = (url, parseResult = noop) => {
  const [loading, setLoading] = useState(Boolean(url));
  const [error, setError] = useState(null);
  const [resource, setResource] = useState(null);

  useEffect(() => {
    if (!url) return;
    if (!promiseCache[url]) {
      setLoading(true);
      promiseCache[url] = fetch(url).then((_) => _.json());
    }
    promiseCache[url]
      .then((result) => {
        setResource(parseResult(result));
        setLoading(false);
        setError(null);
      })
      .catch((error) => {
        console.error(error);
        setResource(null);
        setLoading(false);
        setError(error);
      });
  }, [url, parseResult]);

  if (url === null) {
    return [null, false, null];
  }

  return [resource, loading, error];
};

export default useResource;
