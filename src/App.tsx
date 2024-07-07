import { BrowserRouter } from "react-router-dom";
import { StylesProvider } from "@mui/styles";

import { Layout, ThemeProvider } from "components";
import { GlobalSettingsProvider } from "contexts";

const App = () => {
  return (
    <BrowserRouter>
      <GlobalSettingsProvider>
        <ThemeProvider>
          <StylesProvider injectFirst>
            <Layout />
          </StylesProvider>
        </ThemeProvider>
      </GlobalSettingsProvider>
    </BrowserRouter>
  );
};

export default App;
