import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import * as React from "react";

interface StatAccordionProps {
  summary: string;
  caption: string;
  details?: JSX.Element;
}

export const StatAccordion: React.FC<StatAccordionProps> = ({
  caption,
  summary,
  details,
}) => {
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        IconButtonProps={{
          edge: "end",
        }}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Box display="flex" width="100%" flexDirection="column">
          <Box display="flex">
            <Typography variant="caption" style={{ width: "100%" }}>
              {caption}
            </Typography>
          </Box>
          <Box display="flex" alignItems="flex-end">
            <Typography
              variant="h3"
              style={{
                margin: 0,
                textAlign: "right",
                width: "100%",
              }}
            >
              {summary}
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>
      {details ? <AccordionDetails>{details}</AccordionDetails> : null}
    </Accordion>
  );
};
