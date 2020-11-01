import { List } from "@components/Common/List"
import { ProjectTransaction } from "@models/events/EventMetadata"
import * as React from "react"
import { ProjectTransactionListItem } from "./EventList/ProjectTransactionListItem"


interface ProjectListProps {
  funds: ProjectTransactionListItem[]
  onClickItem: (item: ProjectTransaction) => void
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
      getKey={(g) => `${g.project.uuid}-${g.date.toISOString()}`}
      ListItem={(p) => <ProjectTransactionListItem {...p} />}
    />
  )
}

export default ProjectFundList
