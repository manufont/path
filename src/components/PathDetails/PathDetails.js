import React, { useState, useEffect } from "react";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import InputAdornment from "@material-ui/core/InputAdornment";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ShareIcon from "@material-ui/icons/Share";
import Slider from "@material-ui/core/Slider";
import Input from "@material-ui/core/Input";
import RunFastIcon from "mdi-material-ui/RunFast";

import { formatDuration } from "helpers/date";
import { useBufferedState } from "hooks";

import styles from "./PathDetails.module.css";

const PathDetails = ({ path, speed, setSpeed }) => {
  const [memoPath, setMemoPath] = useState(path);
  const [instantSpeed, setInstantSpeed] = useBufferedState(speed, setSpeed, 200);

  useEffect(() => {
    if (path) {
      setMemoPath(path);
    }
  }, [path, setMemoPath]);

  if (!memoPath) return null;
  const { summary } = memoPath.trip;
  const { length, time } = summary;

  const share = () => {
    navigator.share({
      title: document.title,
      url: document.URL,
    });
  };

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <div className={styles.summary}>
          <Typography variant="h6">
            <strong>{length.toFixed(1)} km</strong>, {formatDuration(time)}
          </Typography>
          {navigator.share && (
            <IconButton className={styles.shareButton} onClick={share}>
              <ShareIcon />
            </IconButton>
          )}
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <div className={styles.speedContainer}>
          <RunFastIcon />
          <Slider
            value={instantSpeed}
            className={styles.slider}
            onChange={(e, value) => setInstantSpeed(value)}
            min={4}
            max={25}
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
              min: 4,
              max: 25,
              type: "number",
              "aria-labelledby": "input-slider",
            }}
          />
        </div>
      </AccordionDetails>
    </Accordion>
  );
};
export default PathDetails;
