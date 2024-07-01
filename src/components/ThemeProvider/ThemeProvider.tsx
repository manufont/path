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
      prefersDark.addEventListener("change", onPrefersDarkChange);
    } catch (e) {
      console.error(e);
    }
    return () => {
      try {
        prefersDark.removeEventListener("change", onPrefersDarkChange);
      } catch (e) {
        console.error(e);
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
