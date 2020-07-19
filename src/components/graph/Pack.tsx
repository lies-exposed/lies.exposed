import { localPoint } from "@vx/event"
import { Group } from "@vx/group"
import { Pack as VXPack } from "@vx/hierarchy"
import { HierarchyNode } from "@vx/hierarchy/lib/types"
import { withTooltip, TooltipWithBounds } from "@vx/tooltip"
import { WithTooltipProvidedProps } from "@vx/tooltip/lib/enhancers/withTooltip"
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

const Pack: React.FC<PackProps & WithTooltipProvidedProps<PackDatum>> = ({
  width,
  height,
  pack,
  showTooltip,
  hideTooltip,
  tooltipData,
  tooltipOpen,
  tooltipLeft,
  tooltipTop,
}) => {
  const handleMouseOver = (datum: PackDatum) => (event: any): void => {
    const coords = localPoint(event.target.ownerSVGElement, event)
    if (coords !== null) {
      if (showTooltip !== undefined) {
        showTooltip({
          tooltipLeft: coords.x,
          tooltipTop: coords.y,
          tooltipData: datum,
        })
      }
    }
  }

  return (
    <div>
      <svg width={width} height={height} style={{ position: "relative" }}>
        <rect width={width} height={height} rx={14} fill="#ffffff" />
        <VXPack root={pack} size={[width, height]}>
          {pack => {
            const circles = pack.descendants().slice(2)
            return (
              <Group>
                {circles.map((circle, i) => {
                  return (
                    <circle
                      key={`cir-${i}`}
                      r={circle.r}
                      cx={circle.x}
                      cy={circle.y}
                      fill={circle.data.color}
                      onMouseLeave={hideTooltip}
                      onMouseOver={handleMouseOver(circle.data)}
                    />
                  )
                })}
              </Group>
            )
          }}
        </VXPack>
      </svg>
      {tooltipOpen && tooltipData !== undefined ? (
        <TooltipWithBounds
          key={Math.random()}
          top={tooltipTop}
          left={tooltipLeft}
          style={{
            maxWidth: 200,
            position: "absolute",
            top: 0,
            backgroundColor: "white",
          }}
        >
          <div>
            <strong>{tooltipData.label}</strong> <strong>({tooltipData.count})</strong>
          </div>
        </TooltipWithBounds>
      ) : null}
    </div>
  )
}

export default withTooltip<PackProps, PackDatum>(Pack)
