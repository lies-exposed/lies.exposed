import { Actor, Common, Events, Group } from "@econnessione/shared/io/http";
import { PathReporter } from "io-ts/lib/PathReporter";
import * as React from "react";
import { ListItemProps } from "../../Common/List";

export interface ProjectTransactionListItemProps {
  event: Events.ProjectTransaction;
  selected: boolean;
  actors: Actor.Actor[];
  groups: Group.Group[];
}

export const ProjectTransactionListItem: React.FC<
  ListItemProps<ProjectTransactionListItemProps>
> = ({ item, onClick }) => {
  const transactionBy = item.event.transaction;

  // eslint-disable-next-line
  console.log(PathReporter.report(Common.ByGroup.decode(transactionBy)));
  // eslint-disable-next-line
  console.log(PathReporter.report(Common.ByActor.decode(transactionBy)));
  return (
    <div
      key={item.event.project}
      style={{ display: "inline-block", margin: 5, cursor: "pointer" }}
      onClick={() => onClick?.(item)}
    >
      {/* {transactionBy.type === "Actor"
        ? pipe(
            O.fromNullable(actors.find(a => a.id === transactionBy.actor)),
            O.map((actor) => (
              <Avatar
                key={actor.fullName}
                name={actor.fullName}
                src={actor.avatar}
              />
            )),
            O.getOrElse(() => <span>Actor is missing</span>)
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
          )} */}
      =&gt;
      {/* {item.transaction.amount} euro =&gt; {item.project.name} */}
      {/* <div
        style={{
          width: "100%",
          height: 3,
          backgroundColor: item.selected ? item.project.color : "white",
        }}
      /> */}
    </div>
  );
};
