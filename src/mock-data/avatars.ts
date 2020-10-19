/* eslint-disable @typescript-eslint/no-var-requires */
import { ImageFileNode } from "@models/Image"

const fileNodeFromPath = (path: string): ImageFileNode => {
  return {
    publicURL: path,
    childImageSharp: {
      fluid: {
        src: path,
        srcWebp: path,
        srcSet: path,
        sizes: "400x400",
        base64: undefined,
        tracedSVG: undefined,
        srcSetWebp: undefined,
        media: undefined,
        aspectRatio: 1,
      },
    },
  }
}

// Actors

export const firstActorAvatar = fileNodeFromPath(
  require("./assets/actors/first-actor.svg")
)
export const secondActorAvatar = fileNodeFromPath(
  require("./assets/actors/second-actor.svg")
)
export const thirdActorAvatar = fileNodeFromPath(
  require("./assets/actors/third-actor.svg")
)

// Groups

export const firstGroupAvatar = fileNodeFromPath(
  require("./assets/groups/first-group.svg")
)
