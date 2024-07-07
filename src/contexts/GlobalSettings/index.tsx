import { useDidUpdateEffect } from "hooks";
import { createContext, PropsWithChildren, useState } from "react";

type PreferredTheme = "auto" | "light" | "dark";

type GlobalSettings = {
  preferredTheme: PreferredTheme;
};

type GlobalSettingsSetters = {
  setPreferredTheme: (preferredTheme: PreferredTheme) => void;
};

const LOCALSTORAGE_KEY = "_global_settings";

const defaultState: GlobalSettings = {
  preferredTheme: "auto",
};

const defaultSetters: GlobalSettingsSetters = {
  setPreferredTheme: () => {},
};

const GlobalSettingsContext = createContext({ ...defaultState, ...defaultSetters });

const getDefaultState = () => {
  const storeState = localStorage.getItem(LOCALSTORAGE_KEY);
  if (storeState) return JSON.parse(storeState) as GlobalSettings;
  return defaultState;
};

const GlobalSettingsProvider = ({ children }: PropsWithChildren) => {
  const [state, setState] = useState(getDefaultState());

  const setPreferredTheme = (preferredTheme: PreferredTheme) => {
    setState({ ...state, preferredTheme });
  };

  useDidUpdateEffect(() => {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <GlobalSettingsContext.Provider value={{ ...state, setPreferredTheme }}>
      {children}
    </GlobalSettingsContext.Provider>
  );
};

export { GlobalSettingsProvider, GlobalSettingsContext };
