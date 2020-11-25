import React from "react";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import { formatDuration } from "helpers/date";

const PathDetails = ({ path }) => {
  const { summary } = path.trip;
  const { length, time } = summary;
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <strong>{length.toFixed(1)} km</strong>, {formatDuration(time)}
      </AccordionSummary>
      <AccordionDetails>blah blah</AccordionDetails>
    </Accordion>
  );
};
export default PathDetails;
