import {
  FontAwesomeIcon,
  type FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import {
  generateRandomColor,
  toColorHash,
} from "@liexp/shared/lib/utils/colors.js";
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
    | "align-justify"
    | "text-height"
    | "italic"
    | "underline"
    | "code"
    | "link"
    | "user"
    | "user-friends"
    | "file-image"
    | "hashtag"
    | "person-half-dress"
    | "users-between-lines"
    | "share-nodes"
    | "map-location"
    | "chart-line";
}

export const FAIcon: React.FC<FAIconProps> = ({
  icon,
  width = 18,
  height = 18,
  ...props
}) => {
  return <FontAwesomeIcon {...{ ...props, width, height }} icon={icon} />;
};

type FAIconFC = React.FC<Omit<FAIconProps, "icon">>;
export const HashtagIcon: FAIconFC = (props) => (
  <FAIcon
    // color={toColorHash(generateRandomColor())}
    color="#da27a4"
    {...props}
    icon={"hashtag"}
  />
);
export const ActorIcon: FAIconFC = (props) => (
  <FAIcon
    // color={toColorHash(generateRandomColor())}
    color="#2ad73e"
    {...props}
    icon={"person-half-dress"}
  />
);
export const GroupIcon: FAIconFC = (props) => (
  <FAIcon
    // color={toColorHash(generateRandomColor())}
    color="#460e16"
    {...props}
    icon={"users-between-lines"}
  />
);
export const UserIcon: FAIconFC = (props) => (
  <FAIcon color={toColorHash(generateRandomColor())} {...props} icon={"user"} />
);
export const SocialPostIcon: FAIconFC = (props) => (
  <FAIcon
    color={toColorHash(generateRandomColor())}
    {...props}
    icon={"share-nodes"}
  />
);
export const AreaIcon: FAIconFC = (props) => (
  <FAIcon
    color={toColorHash(generateRandomColor())}
    {...props}
    icon={"map-location"}
  />
);
export const LinkIcon: FAIconFC = (props) => (
  <FAIcon
    color={toColorHash(generateRandomColor())}
    {...props}
    icon={"link"}
    style={{ cursor: "pointer" }}
  />
);

export const MediaIcon: FAIconFC = (props) => (
  <FAIcon
    color={toColorHash(generateRandomColor())}
    {...props}
    icon={"file-image"}
  />
);

export const GraphIcon: FAIconFC = (props) => (
  <FAIcon
    color={toColorHash(generateRandomColor())}
    {...props}
    icon={"chart-line"}
  />
);
