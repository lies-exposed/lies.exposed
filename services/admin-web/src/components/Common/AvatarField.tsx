import { Avatar } from "@liexp/ui/components/Common/Avatar";
import get from "lodash/get";
import has from "lodash/has";
import * as React from "react";
import { FieldProps, useRecordContext } from "react-admin";

export const AvatarField: React.FC<FieldProps> = (props) => {
  const record = useRecordContext();
  const src =
    props.source && has(record, props.source)
      ? get(record, props.source)
      : undefined;

  return src ? <Avatar src={src} /> : null;
};
