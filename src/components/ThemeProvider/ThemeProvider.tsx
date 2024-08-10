import React, { PropsWithChildren, useContext, useEffect, useState } from "react";
import { Link as RouterLink, LinkProps as RouterLinkProps } from "react-router-dom";
import { LinkProps } from "@mui/material/Link";
import { ThemeProvider as MuiThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import green from "@mui/material/colors/green";
import blueGrey from "@mui/material/colors/blueGrey";
import CssBaseline from "@mui/material/CssBaseline";
import { GlobalSettingsContext } from "contexts";

const LinkBehavior = React.forwardRef<
  HTMLAnchorElement,
  Omit<RouterLinkProps, "to"> & { href: RouterLinkProps["to"] }
>((props, ref) => {
  const { href, ...other } = props;
  // Map href (Material UI) -> to (react-router)
  return <RouterLink ref={ref} to={href} {...other} />;
});

const components = {
  MuiLink: {
    defaultProps: {
      component: LinkBehavior,
    } as LinkProps,
  },
  MuiButtonBase: {
    defaultProps: {
      LinkComponent: LinkBehavior,
    },
  },
};

const lightTheme = createTheme({
  palette: {
    primary: green,
    secondary: blueGrey,
  },
  components,
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: green,
    secondary: blueGrey,
  },
  components,
});

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  // @ts-ignore
  const { preferredTheme } = useContext(GlobalSettingsContext);
  const defaultTheme =
    preferredTheme === "auto"
      ? prefersDark.matches
        ? darkTheme
        : lightTheme
      : preferredTheme === "light"
      ? lightTheme
      : darkTheme;
  const [theme, setTheme] = useState(defaultTheme);

  useEffect(() => {
    if (preferredTheme === "light") {
      setTheme(lightTheme);
    } else if (preferredTheme === "dark") {
      setTheme(darkTheme);
    } else {
      if (preferredTheme !== "auto") return;
      setTheme(prefersDark.matches ? darkTheme : lightTheme);
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
    }
  }, [preferredTheme, setTheme]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

export default ThemeProvider;
