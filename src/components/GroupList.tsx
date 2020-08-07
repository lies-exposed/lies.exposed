import { GroupFrontmatter } from "@models/group"
import { Avatar } from "baseui/avatar"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import * as React from "react"
import { AvatarScale } from "./ActorList"

export interface Group extends GroupFrontmatter {
  selected: boolean
}

interface GroupListProps {
  groups: Group[]
  onGroupClick: (actor: Group) => void
  avatarScale: AvatarScale
}

const GroupList: React.FC<GroupListProps> = ({ groups, onGroupClick, avatarScale }) => {
  return (
    <div>
      {groups.map((g) => (
        <div
          key={g.uuid}
          style={{ display: "inline-block", margin: 5, cursor: "pointer" }}
          onClick={() => {
            onGroupClick(g)
          }}
        >
          {pipe(
            g.avatar,
            O.map((src) => (
              <Avatar
                key={g.uuid}
                name={g.name}
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
              backgroundColor: g.selected
                ? pipe(
                    g.color,
                    O.getOrElse(() => "white")
                  )
                : "white",
            }}
          />
        </div>
      ))}
    </div>
  )
}

export default GroupList
