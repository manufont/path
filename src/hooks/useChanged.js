import { useRef, useEffect } from "react";

export default function useChanged(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  if (ref.current === undefined) return false;
  return ref.current === value;
}
