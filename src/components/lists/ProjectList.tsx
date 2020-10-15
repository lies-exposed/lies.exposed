import { List, ListItemProps } from "@components/Common/List"
import { ProjectFrontmatter } from "@models/Project"
import { Avatar } from "baseui/avatar"
import * as A from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/pipeable"
import * as React from "react"
import { AvatarScale } from "./ActorList"

export interface Project extends ProjectFrontmatter {
  selected: boolean
}

interface ProjectListProps {
  projects: Project[]
  onProjectClick: (item: Project) => void
  avatarScale: AvatarScale
}

export const ProjectListItem: React.FC<
  ListItemProps<Project> & { avatarScale: AvatarScale }
> = ({ item, avatarScale, onClick }) => {
  return (
    <div
      key={item.uuid}
      style={{ display: "inline-block", margin: 5, cursor: "pointer" }}
      onClick={() => onClick?.(item)}
    >
      {pipe(
        item.images,
        A.map((src) => (
          <Avatar
            key={item.uuid}
            name={item.name}
            size={avatarScale}
            src={src.image.childImageSharp.fluid.src}
          />
        ))
      )}
      <div
        style={{
          width: "100%",
          height: 3,
          backgroundColor: item.selected ? item.color : "white",
        }}
      />
    </div>
  )
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onProjectClick: onGroupClick,
  avatarScale,
}) => {
  return (
    <List
      data={projects}
      filter={(_) => true}
      onItemClick={onGroupClick}
      getKey={(g) => g.uuid}
      ListItem={(p) => <ProjectListItem avatarScale={avatarScale} {...p} />}
    />
  )
}

export default ProjectList
