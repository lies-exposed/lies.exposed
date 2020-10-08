import { Group } from "@vx/group"
import * as React from "react"

export interface NetworkNodeDatum {
  uuid: string
  label: string
  innerColor: string
  outerColor: string
}

export interface NetworkPointNode<N extends NetworkNodeDatum>  {
  x: number
  y: number
  data: N
}

export interface NetworkNodeProps<Datum extends NetworkNodeDatum> {
  node: NetworkPointNode<Datum>
  onMouseOver?: (
    event: React.MouseEvent<SVGElement, React.MouseEvent>,
    data: Datum
  ) => void
  onMouseOut?: (event: React.MouseEvent<SVGElement, React.MouseEvent>) => void
  onClick: (event: NetworkPointNode<Datum>) => void
}

export const NetworkNode = <D extends NetworkNodeDatum>({
  node,
  onClick,
  onMouseOver,
  onMouseOut,
}: NetworkNodeProps<D>): JSX.Element => {
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
          onMouseOut,
        }
      : {}),
  }

  const innerCircleColor = node.data.innerColor
  const outerCircleColor = node.data.outerColor

  return (
    <Group {...(groupProps as any)} onClick={() => onClick(node)}>
      <>
        <circle r={8} fill={outerCircleColor} />
        <circle r={6} fill={`#${innerCircleColor}`} />
      </>
    </Group>
  )
}
