import * as React from "react";
import { List } from "../Common/List";
import {
  ProjectTransactionListItem,
  type ProjectTransactionListItemProps,
} from "./EventList/ProjectTransactionListItem";

interface ProjectListProps {
  funds: Array<ProjectTransactionListItemProps["event"]>;
  onClickItem: (item: any) => void;
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
