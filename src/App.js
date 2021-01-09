import { BrowserRouter } from "react-router-dom";
import { StylesProvider } from "@material-ui/core/styles";

import { Layout, ThemeProvider } from "components";

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <StylesProvider injectFirst>
          <Layout />
        </StylesProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
