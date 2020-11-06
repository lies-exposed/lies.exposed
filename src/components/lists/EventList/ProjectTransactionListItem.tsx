import { ListItemProps } from "@components/Common/List"
import { ByActor } from "@models/Common/ByGroupOrActor"
import { ProjectTransaction } from "@models/events/EventMetadata"
import { Avatar } from "baseui/avatar"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import * as React from "react"

export interface ProjectTransactionListItem extends ProjectTransaction {
  selected: boolean
}

export const ProjectTransactionListItem: React.FC<ListItemProps<
  ProjectTransactionListItem
>> = ({ item, onClick }) => {
  const transactionBy = item.transaction.by
  return (
    <div
      key={item.project.uuid}
      style={{ display: "inline-block", margin: 5, cursor: "pointer" }}
      onClick={() => onClick?.(item)}
    >
      {ByActor.is(transactionBy)
        ? pipe(
            transactionBy.actor.avatar,
            O.map((avatar) => (
              <Avatar
                key={transactionBy.actor.fullName}
                name={transactionBy.actor.fullName}
                src={avatar.publicURL}
              />
            )),
            O.getOrElse(() => <span>{transactionBy.actor.fullName}</span>)
          )
        : pipe(
            transactionBy.group.avatar,
            O.map((avatar) => (
              <Avatar
                key={transactionBy.group.name}
                name={transactionBy.group.name}
                src={avatar.publicURL}
              />
            )),
            O.getOrElse(() => <span>{transactionBy.group.fullName}</span>)
          )}
      =&gt;
      {item.transaction.amount} euro =&gt; {item.project.name}
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
