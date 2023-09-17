import { useRecordContext } from "../../react-admin";
import * as React from "react";


export const PatentEventTitle: React.FC = () => {
  const record = useRecordContext();
  return record ? (
    <span>{`Event: ${record.payload.title} on ${record.date}`}</span>
  ) : null;
};
