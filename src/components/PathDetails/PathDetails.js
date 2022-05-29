import React, { useState } from "react";
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
import Slider from "@material-ui/core/Slider";
import Input from "@material-ui/core/Input";
import MuiAlert from "@material-ui/lab/Alert";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

import { formatDuration } from "helpers/date";
import { useBufferedState } from "hooks";

import styles from "./PathDetails.module.css";

const copyUrlToClipboard = () => {
  const dummy = document.createElement("input");
  document.body.appendChild(dummy);
  dummy.value = document.URL;
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);
};

const share = () => {
  navigator.share({
    title: document.title,
    url: document.URL,
  });
};

const PathDescription = ({ path }) => {
  const { summary } = path.trip;
  const { length, time } = summary;
  return (
    <>
      <strong>{length.toFixed(1)} km</strong>, {formatDuration(time)}
    </>
  );
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
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
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

  const onShareClick = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      share();
    } else {
      copyUrlToClipboard();
      setSnackbarOpen(true);
    }
    closeMenu();
  };

  const onSettingsClick = (e) => {
    setShowSettings(true);
    closeMenu();
  };

  const onClear = (e) => {
    e.stopPropagation();
    clearPath();
    closeMenu();
  };

  const closeSnackbar = (e) => {
    e && e.stopPropagation();
    setSnackbarOpen(false);
  };

  const onMenuButtonClick = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
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
        <MenuItem onClick={onShareClick}>
          <ListItemIcon>
            <ShareIcon />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
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
          <div className={styles.settingsTitle}>
            <Typography variant="h6" color="textSecondary">
              Path settings
            </Typography>
            <IconButton onClick={() => setShowSettings(false)}>
              <ExpandLessIcon />
            </IconButton>
          </div>
          <Typography id="continuous-slider" gutterBottom>
            Speed
          </Typography>
          <div className={styles.speedContainer}>
            <Slider
              value={instantSpeed}
              className={styles.speedSlider}
              onChange={(e, value) => setInstantSpeed(value)}
              min={mode === "running" ? 4 : 12}
              max={mode === "running" ? 25 : 45}
              step={1}
              aria-labelledby="input-slider"
            />
            <Input
              value={instantSpeed}
              margin="dense"
              onChange={(e) => setInstantSpeed(e.target.value)}
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
            <div>
              <Typography gutterBottom>Use roads</Typography>
              <div className={styles.sliderContainer}>
                <Slider
                  value={instantUseRoads}
                  onChange={(e, value) => setInstantUseRoads(value)}
                  marks={[
                    { value: 0, label: "No" },
                    { value: 0.5, label: "Maybe" },
                    { value: 1, label: "Yes" },
                  ]}
                  min={0}
                  max={1}
                  step={0.1}
                ></Slider>
              </div>
            </div>
            <div>
              <Typography gutterBottom>Avoid bad surfaces</Typography>
              <div className={styles.sliderContainer}>
                <Slider
                  value={instantAvoidBadSurfaces}
                  onChange={(e, value) => setInstantAvoidBadSurfaces(value)}
                  marks={[
                    { value: 0, label: "No" },
                    { value: 0.5, label: "Maybe" },
                    { value: 1, label: "Yes" },
                  ]}
                  min={0}
                  max={1}
                  step={0.125}
                ></Slider>
              </div>
            </div>
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
};
export default PathDetails;
