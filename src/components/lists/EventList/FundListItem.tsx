import { Fund } from "@models/events/Fund"
import * as React from "react"

interface FundListItemProps {
  fund: Fund
}

export const FundListItem: React.FC<FundListItemProps> = ({ fund }) => {
  return <>{fund.amount}</>
}
