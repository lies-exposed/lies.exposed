import type * as Events from "@liexp/shared/lib/io/http/Events";
import * as React from "react";

export const TransactionTitle: React.FC<{
  record: Events.Transaction.Transaction;
}> = ({ record }) => {
  return <span>Transaction: {record?.payload?.total}</span>;
};
