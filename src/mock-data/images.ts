/* eslint-disable no-restricted-imports */
import { ImageFileNode } from "@models/Image"

// Images
import secondImagePath from '../../static/media/actors/825a1180-ea9c-11ea-89c1-952ed30e8319/29178199_10216293038707708_991755429509857280_n.jpg'
import thirdImagePath from "../../static/media/actors/c6839660-d741-11ea-b57b-a7c066f88ab5/anna-scavuzzo.jpg"
import firstImagePath from "../../static/media/projects/6e193380-0ca3-11eb-83b0-4733f91fd8d8/san-siro-rendering.jpg"

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

export const firstImage = fileNodeFromPath(firstImagePath)
export const secondImage = fileNodeFromPath(secondImagePath)
export const thirdImage = fileNodeFromPath(thirdImagePath)