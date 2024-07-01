import { BrowserRouter } from "react-router-dom";
import { StylesProvider } from "@mui/styles";

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
