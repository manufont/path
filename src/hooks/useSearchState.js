import { useCallback, useMemo } from "react";
import { useHistory, useLocation } from "react-router-dom";
import * as queryString from "query-string";

const noopEncoder = {
  encode: (_) => _,
  decode: (_) => _,
};

// This hook provide a useState-like interface that uses the router search state
// defaultValue must change as little as possible : if value is set to default, it will be updated when default value change.
// encoder must change as little as possible to prevent unwanted setter update.
// encoder is a { encode, decode } object that translate value object into a URI-complient string
// controlled determine whether or not this hook should take control over the value. See https://fr.reactjs.org/docs/uncontrolled-components.html for more.
const useSearchState = (searchParam, defaultValue, encoder = noopEncoder) => {
  const { search } = useLocation();
  const searchObj = queryString.parse(search);
  const searchValue = searchObj[searchParam];
  const value = useMemo(
    () => (searchValue === undefined ? defaultValue : encoder.decode(searchValue)),
    [defaultValue, encoder, searchValue]
  );
  const history = useHistory();

  const getNewLocation = useCallback(
    (value) => {
      const searchObj = queryString.parse(history.location.search);
      const newSearchObj = { ...searchObj, [searchParam]: value };
      const search = queryString.stringify(newSearchObj);
      return { ...history.location, search, state: { origin: "useSearchState" } };
    },
    [searchParam, history]
  );

  const setter = useCallback(
    (newValue, push = false) => {
      const newEncodedValue = encoder.encode(newValue);
      const encodedDefaultValue = encoder.encode(defaultValue);
      const isDefault = newEncodedValue === encodedDefaultValue;
      const updateValue = push ? history.push : history.replace;
      updateValue(getNewLocation(isDefault ? undefined : newEncodedValue));
    },
    [defaultValue, encoder, getNewLocation, history]
  );

  return [value, setter];
};

export default useSearchState;
