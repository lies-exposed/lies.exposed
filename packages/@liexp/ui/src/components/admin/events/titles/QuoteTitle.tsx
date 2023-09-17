import type * as Events from "@liexp/shared/lib/io/http/Events";
import { useRecordContext } from "../../react-admin";
import * as React from "react";


export const QuoteTitle: React.FC = () => {
  const record = useRecordContext<Events.Quote.Quote>();
  return <span>Quote by: {record?.payload?.actor}</span>;
};
