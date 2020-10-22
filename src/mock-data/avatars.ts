/* eslint-disable @typescript-eslint/no-var-requires */
import { ImageFileNode } from "@models/Image"
import * as A from "fp-ts/lib/Array"
import { pipe } from "fp-ts/lib/pipeable"

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

interface Avatars {
  actors: {
    [key: number]: ImageFileNode
  },
  groups: {
    [key: number]: ImageFileNode
  }
}

export const avatars: Avatars = {
  // Actors
  actors: pipe(
    A.range(0, 10),
    A.map((number) =>
      fileNodeFromPath(require(`./assets/actors/actor-${number}.svg`))
    ),
    A.reduceWithIndex({}, (number, acc, asset) => ({
      ...acc,
      [number]: asset,
    }))
  ),
  // Groups
  groups: pipe(
    A.range(0, 10),
    A.map((number) =>
      fileNodeFromPath(require(`./assets/groups/group-${number}.svg`))
    ),
    A.reduceWithIndex({}, (number, acc, asset) => ({
      ...acc,
      [number]: asset,
    }))
  ),
}
