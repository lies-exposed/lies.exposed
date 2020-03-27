import { ActorPageContentFileNode } from "@models/actor"
import { Avatar } from "baseui/avatar"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import * as React from "react"

export interface ActorListActor extends ActorPageContentFileNode {
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
          {pipe(
            a.childMarkdownRemark.frontmatter.avatar,
            O.map(avatar => (
              <Avatar key={a.id} name="Jane Doe" size="scale1000" src={avatar.childImageSharp.fluid.src} />
            )),
            O.toNullable
          )}
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