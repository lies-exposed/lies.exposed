import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import * as React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "../mui";

interface StatAccordionProps {
  summary: string;
  caption: string;
  details?: JSX.Element;
  style?: {
    summary?: React.CSSProperties;
  };
}

export const StatAccordion: React.FC<StatAccordionProps> = ({
  caption,
  summary,
  details,
  style,
}) => {
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
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
                ...style?.summary,
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
