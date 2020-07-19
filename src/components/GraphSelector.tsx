import { isServer } from "@utils/isServer"
import * as React from "react"
import { throttle } from "throttle-debounce"
import { CO2LevelsGraph } from "./CO2LevelsGraph"
import { HumanPopulationGrowthGraph } from "./HumanPopulationGrowthGraph"

interface GraphSelectorProps {
  name: string
}

const getGraph = (
  name: string,
  { width, height }: { width: number; height: number }
): JSX.Element => {
  switch (name) {
    case "human-population-growth": {
      return <HumanPopulationGrowthGraph width={width} height={height} />
    }
    case "co2-levels": {
      return <CO2LevelsGraph width={width} height={height} />
    }
    default:
      return <div>{`${name} doesn't refer to any graph`}</div>
  }
}

export const GraphSelector: React.FC<GraphSelectorProps> = ({ name }) => {
  const containerId = `${name}-graph`

  const getUpdatedSize = (): any => {
    if (!isServer) {
      const element = document.getElementById(containerId)

      if (element !== null) {
        return {
          width: element.clientWidth,
          height: 400,
        }
      }
    }
    return {
      width: 800,
      height: 400,
    }
  }

  const [{ width, height }, setSizes] = React.useState(getUpdatedSize)

  React.useEffect(() => {
    const resizeListener = throttle(100, (): void => setSizes(getUpdatedSize()))
    resizeListener()
    window.addEventListener("resize", resizeListener)

    return () => {
      window.removeEventListener("resize", resizeListener)
    }
  }, [name])

  return (
    <div id={containerId} className="graph-selector" style={{ width: '100%'}}>
      {getGraph(name, { width, height })}
    </div>
  )
}
