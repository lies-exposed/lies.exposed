import * as React from "react"
import { Group } from "@vx/group"
import { HierarchyPointNode } from "d3-hierarchy"
import { EventPoint } from "../../../types/event"
import * as O from "fp-ts/lib/Option"

export interface NetworkNodeProps {
  node: HierarchyPointNode<EventPoint["data"]>
  onMouseOver?: (
    event: React.MouseEvent<SVGElement, React.MouseEvent>,
    data: EventPoint["data"]
  ) => void
  onMouseOut?: (event: React.MouseEvent<SVGElement, React.MouseEvent>) => void
  onClick: (event: EventPoint) => void
}

function NetworkNode({
  node,
  onMouseOver,
  onMouseOut,
  onClick,
}: NetworkNodeProps) {
  const groupProps = {
    ...(onMouseOver
      ? {
          onMouseOver: (
            event: React.MouseEvent<SVGElement, React.MouseEvent>
          ) => onMouseOver(event, node.data),
        }
      : {}),
    ...(onMouseOut ? { onMouseOut } : {}),
  }

  return (
    <Group {...groupProps} onClick={() => onClick(node)}>
      {O.fold(
        () => <circle r={12} fill={node.data.fill} />,
        type => {
          return (
            <>
              <circle
                r={12}
                fill={type === "AntiEcologicAct" ? "red" : "green"}
              />
              <circle r={8} fill={node.data.fill} />
            </>
          )
        }
      )(node.data.frontmatter.type)}
    </Group>
  )
}
export default NetworkNode
