import { localPoint } from "@vx/event";
import { Group } from "@vx/group";
import { Pack as VXPack } from "@vx/hierarchy";
import { HierarchyNode } from "@vx/hierarchy/lib/types";
import { withTooltip, TooltipWithBounds } from "@vx/tooltip";
import { WithTooltipProvidedProps } from "@vx/tooltip/lib/enhancers/withTooltip";
import * as React from "react";
import { useSprings, animated } from "react-spring";

export interface PackDatum {
  label: string;
  count: number;
  color: string;
}

interface PackProps {
  width: number;
  height: number;
  pack: HierarchyNode<PackDatum>;
  variant: "text" | "circle";
  onClick?: () => void;
}

const Pack: React.FC<PackProps & WithTooltipProvidedProps<PackDatum>> = ({
  width,
  height,
  variant,
  pack,
  onClick,
  showTooltip,
  hideTooltip,
  tooltipData,
  tooltipOpen,
  tooltipLeft,
  tooltipTop,
}) => {
  const handleMouseOver =
    (datum: PackDatum) =>
    (event: any): void => {
      const coords = localPoint(event.target.ownerSVGElement, event);
      if (coords !== null) {
        if (showTooltip !== undefined) {
          showTooltip({
            tooltipLeft: coords.x,
            tooltipTop: coords.y,
            tooltipData: datum,
          });
        }
      }
    };

  return (
    <div>
      <svg
        width={width}
        height={height}
        style={{ position: "relative" }}
        onClick={onClick}
      >
        <rect width={width} height={height} rx={14} fill="#ffffff" />
        <VXPack root={pack} size={[width, height]}>
          {(pack) => {
            const circles = pack.descendants().slice(2);

            const [springs] = useSprings(circles.length, (index) => ({
              width: circles[index].r * 2,
            }));
            return springs.map((style, i) => {
              const circle = circles[i];

              return (
                <Group key={i}>
                  <animated.circle
                    key={`cir-${i}`}
                    r={circle.r}
                    cx={circle.x}
                    cy={circle.y}
                    fill={`#${circle.data.color}`}
                    onMouseLeave={hideTooltip}
                    onMouseOver={handleMouseOver(circle.data)}
                    style={style}
                  />

                  <animated.text
                    x={circle.x}
                    y={circle.y}
                    width={circle.r}
                    height={circle.r}
                    fill={
                      variant === "text" ? `#FFFFFF` : "#000000"
                    }
                    style={{
                      fontWeight: 600,
                      textAlign: "center",
                      padding: 10,
                      fontSize: circle.r / 2,
                      overflow: "hidden",
                    }}
                  >
                    #{circle.data.label}
                  </animated.text>
                </Group>
              );
            });
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
            <strong>{tooltipData.label}</strong>{" "}
            <strong>({tooltipData.count.toFixed(2)})</strong>
          </div>
        </TooltipWithBounds>
      ) : null}
    </div>
  );
};

export default withTooltip<PackProps, PackDatum>(Pack);
