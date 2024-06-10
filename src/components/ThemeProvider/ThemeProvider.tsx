import React, { PropsWithChildren, useEffect, useState } from "react";
import { ThemeProvider as MuiThemeProvider } from "@material-ui/core";
import { createTheme } from "@material-ui/core/styles";
import green from "@material-ui/core/colors/green";
import blueGrey from "@material-ui/core/colors/blueGrey";
import CssBaseline from "@material-ui/core/CssBaseline";

const lightTheme = createTheme({
  palette: {
    primary: green,
    secondary: blueGrey,
  },
});

const darkTheme = createTheme({
  palette: {
    type: "dark",
    primary: green,
    secondary: blueGrey,
  },
});

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [theme, setTheme] = useState(prefersDark.matches ? darkTheme : lightTheme);

  useEffect(() => {
    const onPrefersDarkChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? darkTheme : lightTheme);
    };
    try {
      // Chrome & Firefox
      prefersDark.addEventListener("change", onPrefersDarkChange);
    } catch (e1) {
      try {
        // Safari
        prefersDark.addListener(onPrefersDarkChange);
      } catch (e2) {
        console.error(e2);
      }
    }
    return () => {
      try {
        // Chrome & Firefox
        prefersDark.removeEventListener("change", onPrefersDarkChange);
      } catch (e1) {
        try {
          // Safari
          prefersDark.removeListener(onPrefersDarkChange);
        } catch (e2) {
          console.error(e2);
        }
      }
    };
  }, [setTheme]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

export default ThemeProvider;
