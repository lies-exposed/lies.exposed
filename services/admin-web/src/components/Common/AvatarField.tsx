import { Avatar } from "@econnessione/ui/components/Common/Avatar";
import get from "lodash/get";
import has from "lodash/has";
import { FieldProps } from "ra-ui-materialui";
import * as React from "react";

export const AvatarField: React.FC<FieldProps> = (props) => {
  const src =
    props.source && has(props.record, props.source)
      ? get(props.record, props.source)
      : undefined;
  return src ? <Avatar src={src} /> : null;
};
