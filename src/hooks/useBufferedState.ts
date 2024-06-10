import { useState, useMemo } from "react";

import { bufferize } from "helpers/methods";
import useDidUpdateEffect from "./useDidUpdateEffect";

export default function useBufferedState<T>(
  value: T,
  setter: (newValue: T) => void,
  delay: number
) {
  const [instantValue, setInstantValue] = useState<T>(value);

  const bufferedFunc = useMemo(() => bufferize(setter, delay), [setter, delay]);

  useDidUpdateEffect(() => {
    setInstantValue(value);
  }, [setter, value]);

  useDidUpdateEffect(() => {
    bufferedFunc(instantValue);
  }, [instantValue, bufferedFunc]);

  return [instantValue, setInstantValue] as const;
}
