import { makeStyles } from "@material-ui/core";
import * as React from "react";
import ReactTOC from "react-toc";
import { ECOTheme } from "../../theme";

const useStyles = makeStyles<ECOTheme>((props) => ({
  root: {
    margin: "10px 0",
    padding: 0,
    fontFamily: props.typography.h1.fontFamily,
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
  const classes = useStyles();
  return <ReactTOC className={classes.root} {...props} />;
};
