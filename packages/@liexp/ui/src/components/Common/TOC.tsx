import * as React from "react";
import ReactTOC from "react-toc";
import { styled } from "../../theme/index.js";

const PREFIX = "TOC";

const classes = {
  root: `${PREFIX}-root`,
};

const StyledReactTOC = styled(ReactTOC)(({ theme }) => ({
  [`&.${classes.root}`]: {
    margin: "10px 0",
    padding: 0,
    fontFamily: theme.typography.h1.fontFamily,
  },
}));

interface TOCProps {
  markdownText: string;
  titleLimit?: number;
  highestHeadingLevel?: number;
  lowestHeadingLevel?: number;
  className?: string;
  type?: "default" | "raw";
  customMatchers?: any;
}
export const TOC: React.FC<TOCProps> = (props) => {
  return <StyledReactTOC className={classes.root} {...props} />;
};
