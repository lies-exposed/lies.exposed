import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import * as React from "react";

export const LinkIcon: React.FC<Omit<FontAwesomeIconProps, "icon">> = (
  props
) => <FontAwesomeIcon {...props} icon={"link"} style={{ cursor: "pointer" }} />;
