import type * as d3 from "d3";
import { EventTypeColor, EventTypeIconClass } from "../../../Icons";

interface SvgDefs {
  onTransform: (parent: any) => void;
}

export const eventIconsSvgDefs = (
  parent: d3.Selection<SVGGElement, unknown, null, undefined>,
  circleRadius: number,
): SvgDefs => {
  const circleDiameter = circleRadius * 2;
  // event icons svg
  const eventIconPattern = parent
    .append("svg:defs")
    .selectAll("pattern")
    .data(Object.entries(EventTypeIconClass))
    .join("svg:pattern")
    .attr("id", (n) => `event-${n[0].toLowerCase()}`)
    .attr("width", circleDiameter)
    .attr("height", circleDiameter)
    .attr("x", 0)
    .attr("y", 0);

  const eventIconPatternGroup = eventIconPattern.append("g");

  // eventIconPatternGroupRect
  eventIconPatternGroup
    .append("rect")
    .attr("fill", (d) => (EventTypeColor as any)[d[0]])
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", circleDiameter)
    .attr("height", circleDiameter);

  const eventIconSvg = eventIconPatternGroup
    .append("svg:i")
    .attr("class", (d) => `fa fa-${d[1]}`)
    .attr("color", "white")
    .attr("width", circleRadius)
    .attr("height", circleRadius)
    .attr("x", circleRadius / 2)
    .attr("y", circleRadius / 2)
    .style("font-size", `${circleRadius / 2}px`);

  return {
    onTransform(transform) {
      if (!transform) {
        return;
      }

      // const transformedRadius = circleRadius

      // const eventIconRectSize = transformedRadius * 2 / Math.sqrt(transform.k);
      // console.log({ eventIconRectSize });

      // eventIconRect
      //   .attr("width", eventIconRectSize)
      //   .attr("height", eventIconRectSize);

      // const eventIconSvgSize = transformedRadius / Math.sqrt(transform.k);
      // console.log({ eventIconSvgSize });
      eventIconSvg
        // .attr("width", eventIconSvgSize)
        // .attr("height", eventIconSvgSize)
        // .attr("x", eventIconSvgSize / 2)
        // .attr("y", eventIconSvgSize / 2)
        // .style("font-size", () => {
        //   const px = `${Math.round(transformedRadius / Math.sqrt(transform.k))}px`;
        //   return px;
        // });
    },
  };
};
