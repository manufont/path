import { BrowserRouter } from "react-router-dom";
import { StylesProvider } from "@mui/styles";

import { Layout, ThemeProvider } from "components";
import { GlobalSettingsProvider, LibraryProvider } from "contexts";

const App = () => {
  return (
    <BrowserRouter>
      <GlobalSettingsProvider>
        <ThemeProvider>
          <StylesProvider injectFirst>
            <LibraryProvider>
              <Layout />
            </LibraryProvider>
          </StylesProvider>
        </ThemeProvider>
      </GlobalSettingsProvider>
    </BrowserRouter>
  );
};

export default App;
