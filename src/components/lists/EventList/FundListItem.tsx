import { FundFrontmatter } from "@models/Fund"
import * as React from "react"

interface FundListItemProps {
  fund: FundFrontmatter
}

export const FundListItem: React.FC<FundListItemProps> = ({ fund }) => {
  return <>{fund.amount}</>
}
