import type * as Events from "@liexp/shared/lib/io/http/Events/index.js";
import * as React from "react";
import { type FieldProps, useRecordContext } from "../../react-admin.js";

export const DocumentaryReleaseTitle: React.FC<
  FieldProps<Events.Documentary.Documentary>
> = ({ record: _record }) => {
  const record = useRecordContext({ record: _record });
  return <span>Documentary: {record?.payload?.title}</span>;
};
