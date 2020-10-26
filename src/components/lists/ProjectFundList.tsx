import { List, ListItemProps } from "@components/Common/List"
import { ProjectFund } from "@models/events/EventMetadata"
import * as React from "react"

interface ProjectFundItem extends ProjectFund {
  selected: boolean
}

interface ProjectListProps {
  funds: ProjectFundItem[]
  onClickItem: (item: ProjectFund) => void
}

export const ProjectListItem: React.FC<ListItemProps<ProjectFundItem>> = ({
  item,
  onClick,
}) => {
  return (
    <div
      key={item.project.uuid}
      style={{ display: "inline-block", margin: 5, cursor: "pointer" }}
      onClick={() => onClick?.(item)}
    >
      {item.project.name} - {item.amount} euro
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

const ProjectFundList: React.FC<ProjectListProps> = ({
  funds,
  onClickItem,
}) => {
  return (
    <List
      data={funds}
      filter={(_) => true}
      onItemClick={onClickItem}
      getKey={(g) => g.project.uuid}
      ListItem={(p) => <ProjectListItem {...p} />}
    />
  )
}

export default ProjectFundList
