import get from "lodash/get";
import has from "lodash/has";
import * as React from "react";
import { type FieldProps, useRecordContext } from "react-admin";
import { Avatar } from "../../Common/Avatar";

export const AvatarField: React.FC<FieldProps> = (props) => {
  const record = useRecordContext();
  const src =
    props.source && has(record, props.source)
      ? get(record, props.source)
      : undefined;

  return src ? <Avatar src={src} /> : null;
};
