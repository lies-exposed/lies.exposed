import { List, ListItemProps } from "@components/Common/List"
import { ActorFrontmatter } from "@models/actor"
import { Avatar } from "baseui/avatar"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import * as React from "react"

export interface Actor extends ActorFrontmatter {
  selected: boolean
}

export type AvatarScale = "scale1600" | "scale1000"
interface ActorListOptions {
  avatarScale: AvatarScale
}

interface ActorListProps extends ActorListOptions {
  actors: Actor[]
  onActorClick: (actor: Actor) => void
}

const ActorListItem: (
  opts: ActorListOptions
) => React.FC<ListItemProps<Actor>> = ({ avatarScale }) => ({
  item,
  onClick,
}) => {
  return (
    <div
      key={item.uuid}
      style={{ display: "inline-block", margin: 5, cursor: "pointer" }}
      onClick={() => 
        onClick?.(item)
      }
    >
      {pipe(
        item.avatar,
        O.map((src) => (
          <Avatar
            key={item.uuid}
            name={item.fullName}
            size={avatarScale}
            src={src.childImageSharp.fluid.src}
          />
        )),
        O.toNullable
      )}
      <div
        style={{
          width: "100%",
          height: 3,
          backgroundColor: item.selected
            ? pipe(
                item.color,
                O.getOrElse(() => "white")
              )
            : "white",
        }}
      />
    </div>
  )
}

const ActorList: React.FC<ActorListProps> = ({
  actors,
  onActorClick,
  avatarScale,
}) => {
  return (
    <List
      data={actors}
      getKey={(a) => a.uuid}
      filter={(a) => true}
      onItemClick={onActorClick}
      ListItem={ActorListItem({ avatarScale })}
    />
  )
}

export default ActorList
