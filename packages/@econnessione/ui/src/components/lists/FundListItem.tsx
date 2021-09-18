import { Transaction } from "@econnessione/shared/io/http";
import { ListItem } from "@econnessione/ui/components/Common/ListItem";
import * as React from "react";

interface FundListItemProps {
  fund: Transaction.TransactionFrontmatter;
}

export const FundListItem: React.FC<FundListItemProps> = ({ fund }) => {
  return <ListItem>{fund.amount}</ListItem>;
};
