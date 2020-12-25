import { List } from "@components/Common/List"
import { Common, Group } from "@econnessione/io"
import * as React from "react"
import { ActorListItem, AvatarScale } from "./ActorList"
import { GroupListItem } from "./GroupList"


export interface Group extends Group.GroupFrontmatter {
  selected: boolean
}

interface ByEitherGroupOrActorListProps {
  by: Common.ByGroupOrActor[]
  onByClick: (by: Common.ByGroupOrActor) => void
  avatarScale: AvatarScale
}

const GroupOrActorList: React.FC<ByEitherGroupOrActorListProps> = ({
  by,
  onByClick,
  avatarScale,
}) => {
  return (
    <List<Common.ByGroupOrActor>
      data={by}
      filter={(_) => true}
      onItemClick={onByClick}
      getKey={(g) => (g.type === 'Group' ? g.group.id : g.actor.id)}
      ListItem={(p) => {
        const item = p.item
        return item.type === 'Group' ? (
          <GroupListItem
            {...p.item}
            key={`group-${item.group.id}`}
            index={p.index}
            avatarScale={avatarScale}
            item={{ ...item.group, selected: true }}
            onClick={(group) =>
              p.onClick !== undefined
                ? p.onClick({ type: "Group", group })
                : {}
            }
          />
        ) : (
          <ActorListItem
            {...p.item}
            key={`actor-${item.actor.id}`}
            index={p.index}
            avatarScale={avatarScale}
            onClick={(a) =>
              p.onClick !== undefined
                ? p.onClick({ type: "Actor", actor: a })
                : {}
            }
            item={{ ...item.actor, selected: true }}
          />
        )
      }}
    />
  )
}

export default GroupOrActorList
