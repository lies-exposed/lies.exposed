import { List } from "@components/Common/List"
import { ByGroupOrActor, ByGroup } from "@models/Common/ByGroupOrActor"
import { GroupFrontmatter } from "@models/group"
import * as React from "react"
import { ActorListItem, AvatarScale } from "./ActorList"
import { GroupListItem } from "./GroupList"


const isByGroup = (u: unknown): u is ByGroup => 
  (u as ByGroup).__type === 'Group'

export interface Group extends GroupFrontmatter {
  selected: boolean
}

interface ByEitherGroupOrActorListProps {
  by: ByGroupOrActor[]
  onByClick: (by: ByGroupOrActor) => void
  avatarScale: AvatarScale
}

const GroupOrActorList: React.FC<ByEitherGroupOrActorListProps> = ({
  by,
  onByClick,
  avatarScale,
}) => {
  return (
    <List<ByGroupOrActor>
      data={by}
      filter={(_) => true}
      onItemClick={onByClick}
      getKey={(g) => (isByGroup(g) ? g.group.uuid : g.actor.uuid)}
      ListItem={(p) => {
        const item = p.item
        return isByGroup(item) ? (
          <GroupListItem
            {...p.item}
            index={p.index}
            avatarScale={avatarScale}
            item={{ ...item.group, selected: true }}
            onClick={(group) =>
              p.onClick !== undefined
                ? p.onClick({ __type: "Group", group })
                : {}
            }
          />
        ) : (
          <ActorListItem
            {...p.item}
            index={p.index}
            avatarScale={avatarScale}
            onClick={(a) =>
              p.onClick !== undefined
                ? p.onClick({ __type: "Actor", actor: a })
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
