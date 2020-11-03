import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@material-ui/core";

import { Layout } from "components";

import theme from "./theme";

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <Layout></Layout>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
