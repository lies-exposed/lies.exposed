import * as React from "react";
import { type IconProps } from "../../components/mui";
import GreyIcon from "./mattermost-logomark-grey.png";
import WhiteIcon from "./mattermost-logomark-white.png";

interface MattermostIconProps extends IconProps {
  variant: "white" | "blue" | "black";
}

export const MattermostIcon: React.FC<MattermostIconProps> = (props) => {
  const { fontSize } = props;
  const iconSrc =
    props.variant === "white"
      ? WhiteIcon
      : props.variant === "black"
        ? GreyIcon
        : GreyIcon;
  const width = fontSize === "small" ? 18 : 36;
  const height = fontSize === "small" ? 18 : 36;
  return <img src={iconSrc} width={width} height={height} />;
};
