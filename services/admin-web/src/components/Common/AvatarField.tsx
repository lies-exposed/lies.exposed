import { Avatar } from "@liexp/ui/components/Common/Avatar";
import get from "lodash/get";
import has from "lodash/has";
import * as React from "react";
import { FieldProps } from "react-admin";

export const AvatarField: React.FC<FieldProps> = (props) => {
  const src =
    props.source && has(props.record, props.source)
      ? get(props.record, props.source)
      : undefined;

  return src ? <Avatar src={src} /> : null;
};
