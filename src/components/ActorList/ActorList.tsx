import * as React from "react"
import { ActorFileNode } from "../../types/actor"
import { Image } from "../Common"
import "./actorList.scss"

export interface ActorListActor extends ActorFileNode {
  selected: boolean
  color: string
}

interface ActorListProps {
  actors: ActorListActor[]
  onActorClick: (actor: ActorListActor) => void
}

const ActorList: React.FC<ActorListProps> = ({ actors, onActorClick }) => {
  console.log(actors.map(a => a.selected))
  return (
    <div className="actor-list">
      {actors.map(a => (
        <span
          key={a.id}
          className={"actor-list-item is-light"}
          style={{ cursor: "pointer" }}
          onClick={() => onActorClick(a)}
        >
          {a.childMarkdownRemark.frontmatter.cover !== null ? (
            <span style={{ display: "inline-block" }}>
              <Image
                rounded={true}
                src={a.childMarkdownRemark.frontmatter.cover}
                style={{ width: 32, height: 32 }}
                size={32}
              />
              <span
                style={{
                  display: "inline-block",
                  width: 20,
                  height: 3,
                  backgroundColor: (a.selected ? a.color : "white"),
                }}
              />
            </span>
          ) : null}
        </span>
      ))}
    </div>
  )
}

export default ActorList
