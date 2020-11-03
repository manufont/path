import { createMuiTheme } from "@material-ui/core/styles";
import green from "@material-ui/core/colors/green";
import blueGrey from "@material-ui/core/colors/blueGrey";

const theme = createMuiTheme({
  palette: {
    primary: green,
    secondary: blueGrey,
  },
});

export default theme;
