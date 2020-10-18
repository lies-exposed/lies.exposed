import { List } from "@components/Common/List"
import { ByEitherGroupOrActor, ByGroup } from "@models/Common/By"
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
  by: ByEitherGroupOrActor[]
  onByClick: (by: ByEitherGroupOrActor) => void
  avatarScale: AvatarScale
}

const ByEitherGroupOrActorList: React.FC<ByEitherGroupOrActorListProps> = ({
  by,
  onByClick,
  avatarScale,
}) => {

  return (
    <List<ByEitherGroupOrActor>
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

export default ByEitherGroupOrActorList
