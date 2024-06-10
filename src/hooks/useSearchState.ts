import { useCallback, useMemo } from "react";
import { useHistory, useLocation } from "react-router-dom";
import * as queryString from "query-string";
import { Encoder } from "helpers/geo";

const noopEncoder: Encoder<any> = {
  encode: (_) => _,
  decode: (_) => _,
};

// This hook provide a useState-like interface that uses the router search state
// defaultValue must change as little as possible : if value is set to default, it will be updated when default value change.
// encoder must change as little as possible to prevent unwanted setter update.
// encoder is a { encode, decode } object that translate value object into a URI-complient string
const useSearchState = <T>(
  searchParam: string,
  defaultValue: T,
  encoder: Encoder<T> = noopEncoder
) => {
  const { search } = useLocation();
  const searchObj = queryString.parse(search);
  const searchValue = searchObj[searchParam];
  const value = useMemo(
    () => (searchValue === undefined ? defaultValue : encoder.decode(searchValue as string)),
    [defaultValue, encoder, searchValue]
  );
  const history = useHistory();

  const getNewLocation = useCallback(
    (encodedValue?: string) => {
      const searchObj = queryString.parse(history.location.search);
      const newSearchObj = { ...searchObj, [searchParam]: encodedValue };
      const search = queryString.stringify(newSearchObj);
      return { ...history.location, search };
    },
    [searchParam, history]
  );

  const setter = useCallback(
    (newValue: T, push = false) => {
      const newEncodedValue = encoder.encode(newValue);
      const encodedDefaultValue = encoder.encode(defaultValue);
      const isDefault = newEncodedValue === encodedDefaultValue;
      const updateValue = push ? history.push : history.replace;
      updateValue(getNewLocation(isDefault ? undefined : newEncodedValue));
    },
    [defaultValue, encoder, getNewLocation, history]
  );

  return [value, setter] as const;
};

export default useSearchState;
