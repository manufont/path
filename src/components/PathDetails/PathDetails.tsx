import { useState } from "react";
import Divider from "@material-ui/core/Divider";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import InputAdornment from "@material-ui/core/InputAdornment";
import Snackbar from "@material-ui/core/Snackbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import LinearProgress from "@material-ui/core/LinearProgress";
import SettingsIcon from "@material-ui/icons/Settings";
import ShareIcon from "@material-ui/icons/Share";
import ClearIcon from "@material-ui/icons/Clear";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import GetAppIcon from "@material-ui/icons/GetApp";
import Slider from "@material-ui/core/Slider";
import Input from "@material-ui/core/Input";
import MuiAlert from "@material-ui/lab/Alert";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import copy from "clipboard-copy";

import { formatDuration } from "helpers/date";
import { downloadGPX } from "helpers/gpx";
import { useBufferedState } from "hooks";
import { Path } from "hooks/usePath";

import styles from "./PathDetails.module.css";
import OptionSlider from "./OptionSlider";

const share = () => {
  navigator.share({
    title: document.title,
    url: document.URL,
  });
};

type PathDescriptionProps = {
  path: Path;
};

const PathDescription = ({ path }: PathDescriptionProps) => {
  const { summary } = path.trip;
  const { length, time } = summary;
  return (
    <>
      <strong>{length.toFixed(1)} km</strong>, {formatDuration(time)}
    </>
  );
};

type PathDetailsProps = {
  path: Path | null;
  pathLoading: boolean;
  speed: number;
  setSpeed: (speed: number) => void;
  useRoads: number;
  setUseRoads: (useRoads: number) => void;
  avoidBadSurfaces: number;
  setAvoidBadSurfaces: (avoidBadSurfaces: number) => void;
  clearPath: () => void;
  mode: "running" | "cycling";
  showSettings: boolean;
  setShowSettings: (showSettings: boolean) => void;
};

const PathDetails = ({
  path,
  pathLoading,
  speed,
  setSpeed,
  useRoads,
  setUseRoads,
  avoidBadSurfaces,
  setAvoidBadSurfaces,
  clearPath,
  mode,
  showSettings,
  setShowSettings,
}: PathDetailsProps) => {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const [instantSpeed, setInstantSpeed] = useBufferedState(speed, setSpeed, 200);
  const [instantUseRoads, setInstantUseRoads] = useBufferedState(useRoads, setUseRoads, 200);
  const [instantAvoidBadSurfaces, setInstantAvoidBadSurfaces] = useBufferedState(
    avoidBadSurfaces,
    setAvoidBadSurfaces,
    200
  );
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const closeMenu = () => {
    setAnchorEl(null);
  };

  const onShareClick = () => {
    share();
    closeMenu();
  };

  const onCopyLinkClick = () => {
    copy(document.URL);
    setSnackbarOpen(true);
    closeMenu();
  };

  const onSettingsClick = () => {
    setShowSettings(true);
    closeMenu();
  };

  const onClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearPath();
    closeMenu();
  };

  const closeSnackbar = (e?: React.SyntheticEvent) => {
    e && e.stopPropagation();
    setSnackbarOpen(false);
  };

  const onMenuButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.currentTarget) {
      setAnchorEl(e.currentTarget);
    }
  };

  const onDownloadGPXClick = () => {
    if (!path) return;
    downloadGPX(path, document.title);
    closeMenu();
  };

  return (
    <Accordion
      className={styles.root}
      expanded={showSettings}
      onChange={(e, isExpanded) => setShowSettings(isExpanded)}
    >
      <AccordionSummary
        classes={{
          root: styles.accordionRoot,
          content: styles.accordionContent,
          expanded: styles.accordionExpanded,
        }}
      >
        <div className={styles.summary}>
          {path ? (
            <>
              <Typography variant="h6" className={styles.pathDescription}>
                <PathDescription path={path} />
              </Typography>
              <IconButton className={styles.shareButton} onClick={onClear}>
                <ClearIcon />
              </IconButton>
              <IconButton className={styles.shareButton} onClick={onMenuButtonClick}>
                <MoreVertIcon />
              </IconButton>
            </>
          ) : pathLoading ? (
            <LinearProgress className={styles.progress} />
          ) : (
            <Typography>Click on the map to start mapping your path</Typography>
          )}
        </div>
      </AccordionSummary>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        {Boolean(navigator.share) && (
          <MenuItem onClick={onShareClick}>
            <ListItemIcon>
              <ShareIcon />
            </ListItemIcon>
            <ListItemText>Share</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={onCopyLinkClick}>
          <ListItemIcon>
            <FileCopyIcon />
          </ListItemIcon>
          <ListItemText>Copy link</ListItemText>
        </MenuItem>
        <MenuItem onClick={onDownloadGPXClick}>
          <ListItemIcon>
            <GetAppIcon />
          </ListItemIcon>
          <ListItemText>Export GPX</ListItemText>
        </MenuItem>
        <MenuItem onClick={onSettingsClick}>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText>{showSettings ? "Hide" : "Show"} settings</ListItemText>
        </MenuItem>
        <MenuItem onClick={onClear}>
          <ListItemIcon>
            <ClearIcon />
          </ListItemIcon>
          <ListItemText>Clear</ListItemText>
        </MenuItem>
      </Menu>
      <Snackbar open={snackbarOpen} autoHideDuration={2000} onClose={closeSnackbar}>
        <MuiAlert variant="filled" onClose={closeSnackbar} severity="success">
          URL copied to clipboard !
        </MuiAlert>
      </Snackbar>
      <AccordionDetails className={styles.accordionDetails}>
        <Divider />
        <div>
          <div className={styles.settingsTitle} onClick={() => setShowSettings(false)}>
            <Typography variant="h6" color="textSecondary">
              Path settings
            </Typography>
            <IconButton onClick={() => setShowSettings(false)}>
              <ExpandLessIcon />
            </IconButton>
          </div>
          <Typography className={styles.title}>Speed</Typography>
          <div className={styles.speedContainer}>
            <Slider
              value={instantSpeed}
              className={styles.speedSlider}
              onChange={(e, value) => setInstantSpeed(Number(value))}
              min={mode === "running" ? 4 : 12}
              max={mode === "running" ? 25 : 45}
              step={1}
              aria-labelledby="input-slider"
            />
            <Input
              value={instantSpeed}
              margin="dense"
              onChange={(e) => setInstantSpeed(Number(e.target.value))}
              endAdornment={<InputAdornment position="end">Km/h</InputAdornment>}
              inputProps={{
                step: 1,
                min: mode === "running" ? 4 : 12,
                max: mode === "running" ? 25 : 45,
                type: "number",
                "aria-labelledby": "input-slider",
              }}
            />
          </div>
        </div>
        {mode === "cycling" && (
          <>
            <div className={styles.optionSlider}>
              <Typography className={styles.title}>Use roads</Typography>
              <OptionSlider
                value={instantUseRoads}
                onValueChange={setInstantUseRoads}
                labels={["More paths", "More roads"]}
              />
            </div>
            <div className={styles.optionSlider}>
              <Typography className={styles.title}>Avoid bad surfaces</Typography>
              <OptionSlider
                value={instantAvoidBadSurfaces}
                onValueChange={setInstantAvoidBadSurfaces}
                labels={["No", "Yes"]}
              />
            </div>
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
};
export default PathDetails;
