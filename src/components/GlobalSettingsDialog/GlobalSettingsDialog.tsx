import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormLabel,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { GlobalSettingsContext } from "contexts";
import { useContext } from "react";

type GlobalSettingsProps = {
  open: boolean;
  onClose: () => void;
};

const GlobalSettingsDialog = ({ open, onClose }: GlobalSettingsProps) => {
  const { preferredTheme, setPreferredTheme } = useContext(GlobalSettingsContext);

  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>Global Settings</DialogTitle>
      <DialogContent>
        <FormLabel>App Theme</FormLabel>
        <br />
        <ToggleButtonGroup
          color="primary"
          value={preferredTheme}
          exclusive
          onChange={(e, value) => setPreferredTheme(value)}
        >
          <ToggleButton value="auto">Auto</ToggleButton>
          <ToggleButton value="light">Light</ToggleButton>
          <ToggleButton value="dark">Dark</ToggleButton>
        </ToggleButtonGroup>
      </DialogContent>
      <DialogActions>
        <Button color="secondary" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GlobalSettingsDialog;
