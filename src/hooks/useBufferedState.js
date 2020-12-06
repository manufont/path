import { useState, useEffect, useMemo } from "react";

import { bufferize } from "helpers/methods";

export default function useBufferedState(value, setter, delay) {
  const [instantValue, setInstantValue] = useState(value);

  const bufferedFunc = useMemo(() => bufferize(setter, delay), [setter, delay]);

  useEffect(() => {
    bufferedFunc(instantValue);
  }, [instantValue, bufferedFunc]);

  return [instantValue, setInstantValue];
}
