import React, { useEffect, useState } from "react";
import { ThemeProvider as MuiThemeProvider } from "@material-ui/core";
import { createMuiTheme } from "@material-ui/core/styles";
import green from "@material-ui/core/colors/green";
import blueGrey from "@material-ui/core/colors/blueGrey";
import CssBaseline from "@material-ui/core/CssBaseline";

const lightTheme = createMuiTheme({
  palette: {
    primary: green,
    secondary: blueGrey,
  },
});

const darkTheme = createMuiTheme({
  palette: {
    type: "dark",
    primary: green,
    secondary: blueGrey,
  },
});

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(prefersDark.matches || true ? darkTheme : lightTheme);

  useEffect(() => {
    const onPrefersDarkChange = (e) => {
      setTheme(e.matches ? darkTheme : lightTheme);
    };

    prefersDark.addEventListener("change", onPrefersDarkChange);
    return () => prefersDark.removeEventListener("change", onPrefersDarkChange);
  }, [setTheme]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

export default ThemeProvider;
