import { List } from "@components/Common/List";
import { Events } from "@econnessione/shared/lib/io/http";
import * as React from "react";
import {
  ProjectTransactionListItem,
  ProjectTransactionListItemProps,
} from "./EventList/ProjectTransactionListItem";

interface ProjectListProps {
  funds: Array<ProjectTransactionListItemProps["event"]>;
  onClickItem: (item: Events.ProjectTransaction.ProjectTransaction) => void;
}

const ProjectFundList: React.FC<ProjectListProps> = ({
  funds,
  onClickItem,
}) => {
  return (
    <List
      data={funds}
      filter={(_) => true}
      onItemClick={onClickItem}
      getKey={(g) => `${g.project}-${g.date.toISOString()}`}
      ListItem={(p) => (
        <ProjectTransactionListItem
          item={{ event: p.item, actors: [], groups: [], selected: false }}
          index={p.index}
        />
      )}
    />
  );
};

export default ProjectFundList;
