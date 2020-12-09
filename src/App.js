import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@material-ui/core";
import { StylesProvider } from "@material-ui/core/styles";

import { Layout } from "components";

import theme from "./theme";

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <StylesProvider injectFirst>
          <Layout />
        </StylesProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
