import {
  FontAwesomeIcon,
  type FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import * as React from "react";

export interface FAIconProps extends FontAwesomeIconProps {
  icon:
    | "check"
    | "clock"
    | "spinner"
    | "check-double"
    | "exclamation"
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
    | "edit"
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
    | "chart-line"
    | "flag";
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
  <FAIcon color="#da27a4" {...props} icon={"hashtag"} />
);
export const ActorIcon: FAIconFC = (props) => (
  <FAIcon color="#2ad73e" {...props} icon={"person-half-dress"} />
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
  <FAIcon color="#3b82f6" {...props} icon={"user"} />
);
export const SocialPostIcon: FAIconFC = (props) => (
  <FAIcon color="#8b5cf6" {...props} icon={"share-nodes"} />
);
export const AreaIcon: FAIconFC = (props) => (
  <FAIcon color="#f59e0b" {...props} icon={"map-location"} />
);
export const LinkIcon: FAIconFC = (props) => (
  <FAIcon
    color="#6366f1"
    {...props}
    icon={"link"}
    style={{ cursor: "pointer" }}
  />
);

export const MediaIcon: FAIconFC = (props) => (
  <FAIcon color="#ec4899" {...props} icon={"file-image"} />
);

export const GraphIcon: FAIconFC = (props) => (
  <FAIcon color="#14b8a6" {...props} icon={"chart-line"} />
);

export const NationIcon: FAIconFC = (props) => (
  <FAIcon color="#ef4444" {...props} icon="flag" />
);
