// eslint-disable-next-line no-restricted-imports
import { Typography, type TypographyOwnProps } from "@mui/material";
import * as React from "react";
import EllipsisComponent from "react-ellipsis-component";
import { type EllipsisProps } from "react-ellipsis-component/dist/type";

interface EllipsesContentProps extends Omit<EllipsisProps, "ellipsis"> {
  height?: number;
  ellipsis?: boolean;
  variant?: TypographyOwnProps["variant"];
}

const EllipsesContent: React.FC<EllipsesContentProps> = ({
  height,
  text,
  ellipsis = true,
  variant = "body1",
  ...props
}) => {
  return (
    <Typography variant={variant}>
      <EllipsisComponent ellipsis text={text} {...props} />
    </Typography>
  );
};
export default EllipsesContent;
