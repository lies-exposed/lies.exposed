import { Avatar } from "@econnessione/shared/components/Common/Avatar";
import { FieldProps } from "ra-ui-materialui";
import * as React from "react";

export const AvatarField: React.FC<FieldProps> = (props) => {
  const src =
    props.record && props.source ? props.record[props.source] : undefined;
  return src ? <Avatar src={src} /> : <div>No source given</div>;
};
