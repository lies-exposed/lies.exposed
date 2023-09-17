import { type http } from "@liexp/shared/lib/io";
import * as React from "react";
import { useRecordContext } from "react-admin";


export const DeathEventTitle: React.FC = () => {
  const record = useRecordContext<http.Events.Death.Death>();
  return (
    <span>
      Event: {record?.payload?.victim} on {record?.date.toString()}
    </span>
  );
};
