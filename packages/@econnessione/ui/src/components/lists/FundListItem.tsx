import { Transaction } from "@econnessione/shared/io/http";
import * as React from "react";
import { ListItem } from "@components/Common/ListItem";

interface FundListItemProps {
  fund: Transaction.TransactionFrontmatter;
}

export const FundListItem: React.FC<FundListItemProps> = ({ fund }) => {
  return <ListItem>{fund.amount}</ListItem>;
};
