import { useState } from "react";
import styled from "@emotion/styled";
import Divider from "@mui/material/Divider";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import InputAdornment from "@mui/material/InputAdornment";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import SettingsIcon from "@mui/icons-material/Settings";
import ShareIcon from "@mui/icons-material/Share";
import ClearIcon from "@mui/icons-material/Clear";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import GetAppIcon from "@mui/icons-material/GetApp";
import Slider from "@mui/material/Slider";
import Input from "@mui/material/Input";
import MuiAlert from "@mui/material/Alert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import copy from "clipboard-copy";

import { formatDuration } from "helpers/date";
import { downloadGPX } from "helpers/gpx";
import { useBufferedState } from "hooks";
import { Path } from "hooks/usePath";

import OptionSlider from "./OptionSlider";
import { ClassNames } from "@emotion/react";

const share = () => {
  navigator.share({
    title: document.title,
    url: document.URL,
  });
};

type PathDescriptionTextProps = {
  path: Path;
};

const PathDescriptionText = ({ path }: PathDescriptionTextProps) => {
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

  const closeSnackbar = (e?: React.SyntheticEvent | Event) => {
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
    <ClassNames>
      {({ css }) => (
        <Accordion
          expanded={showSettings}
          onChange={(e, isExpanded) => setShowSettings(isExpanded)}
        >
          <AccordionSummary
            classes={{
              root: css`
                padding-right: 4px;
              `,
              content: css`
                margin: 6px 0;
              `,
              expanded: css`
                margin-top: 0 !important;
                margin-bottom: 0 !important;
              `,
            }}
          >
            <SummaryDiv>
              {path ? (
                <>
                  <PathDescription variant="h6">
                    <PathDescriptionText path={path} />
                  </PathDescription>
                  <IconButton onClick={onClear}>
                    <ClearIcon />
                  </IconButton>
                  <IconButton onClick={onMenuButtonClick}>
                    <MoreVertIcon />
                  </IconButton>
                </>
              ) : pathLoading ? (
                <StyledLinearProgress />
              ) : (
                <Typography>Click on the map to start mapping your path</Typography>
              )}
            </SummaryDiv>
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
          <StyledAccordionDetails>
            <Divider />
            <div>
              <SettingsTitleDiv onClick={() => setShowSettings(false)}>
                <Typography variant="h6" color="textSecondary">
                  Path settings
                </Typography>
                <IconButton onClick={() => setShowSettings(false)}>
                  <ExpandLessIcon />
                </IconButton>
              </SettingsTitleDiv>
              <Typography>Speed</Typography>
              <SpeedContainerDiv>
                <SpeedSlider
                  value={instantSpeed}
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
              </SpeedContainerDiv>
            </div>
            {mode === "cycling" && (
              <>
                <OptionSliderDiv>
                  <Typography>Use roads</Typography>
                  <OptionSlider
                    value={instantUseRoads}
                    onValueChange={setInstantUseRoads}
                    labels={["More paths", "More roads"]}
                  />
                </OptionSliderDiv>
                <OptionSliderDiv>
                  <Typography>Avoid bad surfaces</Typography>
                  <OptionSlider
                    value={instantAvoidBadSurfaces}
                    onValueChange={setInstantAvoidBadSurfaces}
                    labels={["No", "Yes"]}
                  />
                </OptionSliderDiv>
              </>
            )}
          </StyledAccordionDetails>
        </Accordion>
      )}
    </ClassNames>
  );
};
export default PathDetails;

const SummaryDiv = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  min-height: 48px;
`;

const SpeedContainerDiv = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  > * {
    margin: 0 8px;
  }
`;

const SpeedSlider = styled(Slider)`
  flex: 1;
`;

const OptionSliderDiv = styled.div`
  :not(:last-child) {
    margin-bottom: 12px;
  }
`;

const StyledAccordionDetails = styled(AccordionDetails)`
  flex-direction: column;
  padding-top: 0;
`;

const StyledLinearProgress = styled(LinearProgress)`
  flex: 1;
`;

const PathDescription = styled(Typography)`
  flex: 1;
`;

const SettingsTitleDiv = styled.div`
  padding-left: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;
