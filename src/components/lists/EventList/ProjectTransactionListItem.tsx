import { ListItemProps } from "@components/Common/List"
import { ProjectTransaction } from "@models/events/EventMetadata"
import * as React from 'react'

export interface ProjectTransactionListItem extends ProjectTransaction {
  selected: boolean
}

export const ProjectTransactionListItem: React.FC<ListItemProps<ProjectTransactionListItem>> = ({
  item,
  onClick,
}) => {
  return (
    <div
      key={item.project.uuid}
      style={{ display: "inline-block", margin: 5, cursor: "pointer" }}
      onClick={() => onClick?.(item)}
    >
      {item.transaction.by.__type === 'Group'? item.transaction.by.group.name : item.transaction.by.actor.fullName} =&gt;
      {item.transaction.amount} euro =&gt;  {item.project.name}
      <div
        style={{
          width: "100%",
          height: 3,
          backgroundColor: item.selected ? item.project.color : "white",
        }}
      />
    </div>
  )
}
