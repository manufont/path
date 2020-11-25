import { useState, useCallback, useMemo, useEffect } from "react";
import { useHistory } from "react-router-dom";
import * as queryString from "query-string";

import { bufferize } from "helpers/methods";
import usePrevious from "./usePrevious";

const noopEncoder = {
  encode: (_) => _,
  decode: (_) => _,
};

// This hook provide a useState-like interface that uses the router search state
// defaultValue must change as little as possible : if value is set to default, it will be updated when default value change.
// encoder must change as little as possible to prevent unwanted setter update.
// encoder is a { encode, decode } object that translate value object into a URI-complient string
// controlled determine whether or not this hook should take control over the value. See https://fr.reactjs.org/docs/uncontrolled-components.html for more.
const useSearchState = (searchParam, defaultValue, encoder = noopEncoder, controlled = true) => {
  const history = useHistory();
  const searchObj = queryString.parse(history.location.search);
  const searchValue = searchObj[searchParam];
  const prevDefaultValue = usePrevious(defaultValue);
  const prevEncoder = usePrevious(encoder);
  const [value, setValue] = useState(
    searchValue === undefined ? defaultValue : encoder.decode(searchValue)
  );

  const getNewLocation = useCallback(
    (value) => {
      const searchObj = queryString.parse(history.location.search);
      const newSearchObj = {
        ...searchObj,
        [searchParam]: value,
      };
      const search = queryString.stringify(newSearchObj);
      return { ...history.location, search };
    },
    [searchParam, history]
  );

  const pushValue = useMemo(
    () =>
      bufferize((value) => {
        history.push(getNewLocation(value));
      }, 100),
    [history, getNewLocation]
  );

  const replaceValue = useMemo(
    () =>
      bufferize((value) => {
        history.replace(getNewLocation(value));
      }, 100),
    [history, getNewLocation]
  );

  const setter = useCallback(
    (newValue, push = false) => {
      const newEncodedValue = encoder.encode(newValue);
      const encodedDefaultValue = encoder.encode(defaultValue);
      const isDefault = newEncodedValue === encodedDefaultValue;
      const updateValue = push ? pushValue : replaceValue;
      updateValue(isDefault ? undefined : newEncodedValue);
      if (controlled) {
        setValue(newValue);
      }
    },
    [controlled, defaultValue, encoder, pushValue, replaceValue]
  );

  // If defaultValue change but value doesn't, we need to check if value was set to defaultValue.
  // If true, we need to set it to the new defaultValue.
  useEffect(() => {
    if (!prevDefaultValue || !prevEncoder || prevDefaultValue === defaultValue) return;
    const encodedValue = prevEncoder.encode(value);
    const encodedPrevDefaultValue = prevEncoder.encode(prevDefaultValue);
    const wasDefault = encodedValue === encodedPrevDefaultValue;
    if (wasDefault && controlled) {
      setValue(defaultValue);
    }
  }, [searchParam, defaultValue, prevDefaultValue, value, prevEncoder, controlled]);

  return [value, setter];
};

export default useSearchState;
