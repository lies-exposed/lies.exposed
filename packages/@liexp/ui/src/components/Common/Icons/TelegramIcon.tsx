import {
  FontAwesomeIcon,
  type FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import * as React from "react";

export const TelegramIcon: React.FC<Omit<FontAwesomeIconProps, "icon">> = (
  props
) => <FontAwesomeIcon {...props} icon={["fab", "telegram"]} />;
