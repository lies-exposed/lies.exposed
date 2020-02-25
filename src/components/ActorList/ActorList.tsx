import { ActorFileNode } from "@models/actor"
import { Avatar } from "baseui/avatar"
import * as React from "react"

export interface ActorListActor extends ActorFileNode {
  selected: boolean
  color: string
}

interface ActorListProps {
  actors: ActorListActor[]
  onActorClick: (actor: ActorListActor) => void
}

const ActorList: React.FC<ActorListProps> = ({ actors, onActorClick }) => {
  return (
    <div>
      {actors.map(a => (
        <div
          key={a.id}
          style={{ display: "inline-block", margin: 5, cursor: "pointer" }}
          onClick={() => onActorClick(a)}
        >
          {a.childMarkdownRemark.frontmatter.cover !== null ? (
            <Avatar
              name="Jane Doe"
              size="scale1000"
              src={a.childMarkdownRemark.frontmatter.cover}
            />
          ) : null}
          <div
            style={{
              width: "100%",
              height: 3,
              backgroundColor: a.selected ? a.color : "white",
            }}
          />
        </div>
      ))}
    </div>
  )
}

export default ActorList
