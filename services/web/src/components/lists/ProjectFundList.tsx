import { List } from "@components/Common/List"
import { Events } from "@econnessione/io"
import * as React from "react"
import { ProjectTransactionListItem } from "./EventList/ProjectTransactionListItem"


interface ProjectListProps {
  funds: ProjectTransactionListItem[]
  onClickItem: (item: Events.ProjectTransaction.ProjectTransaction) => void
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
      getKey={(g) => `${g.project.id}-${g.date.toISOString()}`}
      ListItem={(p) => <ProjectTransactionListItem {...p} />}
    />
  )
}

export default ProjectFundList
