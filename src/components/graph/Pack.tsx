import { Group } from "@vx/group"
import { Pack as VXPack } from "@vx/hierarchy"
import { HierarchyNode } from "@vx/hierarchy/lib/types"
import React from "react"

export interface PackDatum {
  label: string
  count: number
  color: string
}

interface PackProps {
  width: number
  height: number
  pack: HierarchyNode<PackDatum>
}

export const Pack: React.FC<PackProps> = ({ width, height, pack }) => {
  return (
    <svg width={width} height={height}>
      <rect width={width} height={height} rx={14} fill="#ffffff" />
      <VXPack root={pack} size={[width, height]}>
        {pack => {
          const circles = pack.descendants().slice(2)
          return (
            <Group>
              {circles.map((circle, i) => {
                return (
                  <>
                    <circle
                      key={`cir-${i}`}
                      r={circle.r}
                      cx={circle.x}
                      cy={circle.y}
                      fill={circle.data.color}
                    />
                    <text x={circle.x} y={circle.y} style={{ zIndex: 100 }}>
                      {circle.data.label} ({circle.data.count})
                    </text>
                  </>
                )
              })}
            </Group>
          )
        }}
      </VXPack>
    </svg>
  )
}
