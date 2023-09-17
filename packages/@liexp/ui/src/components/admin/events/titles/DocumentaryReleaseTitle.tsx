import type * as Events from "@liexp/shared/lib/io/http/Events";
import { useRecordContext } from "../../react-admin";
import * as React from "react";


export const DocumentaryReleaseTitle: React.FC = () => {
  const record = useRecordContext<Events.Documentary.Documentary>();
  return <span>Documentary: {record?.payload?.title}</span>;
};
