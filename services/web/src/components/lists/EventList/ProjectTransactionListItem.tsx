import { ListItemProps } from "@components/Common/List"
import { Common, Events } from "@econnessione/io"
import { Avatar } from "baseui/avatar"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import { PathReporter } from "io-ts/lib/PathReporter"
import * as React from "react"

export interface ProjectTransactionListItem extends Events.ProjectTransaction.ProjectTransaction {
  selected: boolean
}

export const ProjectTransactionListItem: React.FC<ListItemProps<
  ProjectTransactionListItem
>> = ({ item, onClick }) => {
  const transactionBy = item.transaction.by

  // eslint-disable-next-line
  console.log(PathReporter.report( Common.ByGroup.decode(transactionBy)))
  // eslint-disable-next-line
  console.log(PathReporter.report( Common.ByActor.decode(transactionBy)))
  return (
    <div
      key={item.project.id}
      style={{ display: "inline-block", margin: 5, cursor: "pointer" }}
      onClick={() => onClick?.(item)}
    >
      {transactionBy.type === 'Actor'
        ? pipe(
            transactionBy.actor.avatar,
            O.map((avatar) => (
              <Avatar
                key={transactionBy.actor.fullName}
                name={transactionBy.actor.fullName}
                src={avatar}
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
                src={avatar}
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
