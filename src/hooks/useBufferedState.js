import { useState, useMemo } from "react";

import { bufferize } from "helpers/methods";
import useDidUpdateEffect from "./useDidUpdateEffect";

export default function useBufferedState(value, setter, delay) {
  const [instantValue, setInstantValue] = useState(value);

  const bufferedFunc = useMemo(() => bufferize(setter, delay), [setter, delay]);

  useDidUpdateEffect(() => {
    setInstantValue(value);
  }, [setter, value]);

  useDidUpdateEffect(() => {
    bufferedFunc(instantValue);
  }, [instantValue, bufferedFunc]);

  return [instantValue, setInstantValue];
}
