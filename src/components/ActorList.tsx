import { ActorFrontmatter } from "@models/actor"
import { Avatar } from "baseui/avatar"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import * as React from "react"

export interface ActorListActor extends ActorFrontmatter {
  selected: boolean
}

interface ActorListProps {
  actors: ActorListActor[]
  onActorClick: (actor: ActorListActor) => void
}

const ActorList: React.FC<ActorListProps> = ({ actors, onActorClick }) => {
  return (
    <div>
      {actors.map((a) => (
        <div
          key={a.uuid}
          style={{ display: "inline-block", margin: 5, cursor: "pointer" }}
          onClick={() => {
            onActorClick(a)
          }}
        >
          {pipe(
            a.avatar,
            O.map((src) => (
              <Avatar
                key={a.username}
                name={a.fullName}
                size="scale1600"
                src={src.childImageSharp.fluid.src}
              />
            )),
            O.toNullable
          )}
          <div
            style={{
              width: "100%",
              height: 3,
              backgroundColor: a.selected
                ? pipe(
                    a.color,
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

export default ActorList
