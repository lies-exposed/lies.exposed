import * as t from "io-ts"

export const TopicNode = t.interface(
  {
    id: t.string,
    name: t.string,
  },
  "TopicNode"
)

export type TopicNode = t.TypeOf<typeof TopicNode>


export const TopicPoint = t.interface({
  id: t.string,
  x: t.number,
  y: t.number,
  label: t.string,
  fill: t.string
}, 'TopicPoint')

export type TopicPoint = t.TypeOf<typeof TopicPoint>