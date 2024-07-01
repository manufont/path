import React, { PropsWithChildren, useEffect, useState } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import green from "@mui/material/colors/green";
import blueGrey from "@mui/material/colors/blueGrey";
import CssBaseline from "@mui/material/CssBaseline";

const lightTheme = createTheme({
  palette: {
    primary: green,
    secondary: blueGrey,
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
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
