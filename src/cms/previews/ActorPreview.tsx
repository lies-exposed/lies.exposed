import * as React from "react"
import ActorList from "../../components/ActorList/ActorList"

export const ActorPreview: React.FC<any> = props => {
  const { entry } = props
  const avatar = props.getAsset(entry.getIn(["data", "avatar"]))
  const actor = {
    ...entry.getIn(["data"]).toObject(),
    avatar,
    selected: false,
  }
  return <ActorList actors={[actor]} onActorClick={() => undefined} />
}
