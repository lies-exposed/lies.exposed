import { EventPoint } from "@models/event"
import { getColorByEventType } from "@utils/event"
import { Group } from "@vx/group"
import { HierarchyPointNode } from "d3-hierarchy"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import * as React from "react"

export interface NetworkNodeProps {
  node: HierarchyPointNode<EventPoint["data"]>
  onMouseOver?: (
    event: React.MouseEvent<SVGElement, React.MouseEvent>,
    data: EventPoint["data"]
  ) => void
  onMouseOut?: (event: React.MouseEvent<SVGElement, React.MouseEvent>) => void
  onClick: (event: EventPoint) => void
}

const NetworkNode: React.FC<NetworkNodeProps> = ({
  node,
  onMouseOver,
  onMouseOut,
  onClick,
}) => {
  const groupProps = {
    ...(onMouseOver !== undefined
      ? {
          onMouseOver: (
            event: React.MouseEvent<SVGElement, React.MouseEvent>
          ) => onMouseOver(event, node.data),
        }
      : {}),
    ...(onMouseOut !== undefined
      ? {
          onMouseOut
        }
      : {}),
  }

  return (
    <Group {...(groupProps as any)} onClick={() => onClick(node)}>
      {pipe(
        node.data.frontmatter.type,
        O.fold(
          () => <circle r={6} fill={"#fff"} />,
          (type) => (
            <>
              <circle
                r={6}
                fill={getColorByEventType({ type: O.some(type) })}
              />
              <circle r={2} fill={"#fff"} />
            </>
          )
        )
      )}
    </Group>
  )
}
export default NetworkNode
