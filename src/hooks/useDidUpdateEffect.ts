import React, { useEffect, useRef } from "react";

//this hooks behave similarly to useEffect, but skip mounting
function useDidUpdateEffect(effect: React.EffectCallback, inputs?: React.DependencyList) {
  const fncRef = useRef<React.EffectCallback>();
  fncRef.current = effect;
  const didMountRef = useRef(false);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
    } else if(fncRef.current){
      return fncRef.current();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, inputs);
}

export default useDidUpdateEffect;
