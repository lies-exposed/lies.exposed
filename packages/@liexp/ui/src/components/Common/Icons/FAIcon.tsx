import {
  FontAwesomeIcon,
  type FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import * as React from "react";

export interface FAIconProps extends FontAwesomeIconProps {
  icon:
    | "paragraph"
    | "header"
    | "quote-left"
    | "remove"
    | "bold"
    | "align-left"
    | "align-right"
    | "align-center"
    | 'align-justify'
    | "text-height"
    | "italic"
    | "underline"
    | "code"
    | "link"
    | 'user'
    | 'user-friends'
    | 'file-image';
}

export const FAIcon: React.FC<FAIconProps> = ({ icon, ...props }) => {
  return <FontAwesomeIcon {...props} icon={icon} />;
};
