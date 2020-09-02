import { themedUseStyletron } from "@theme/CustomeTheme"
import { ParagraphMedium } from "baseui/typography"
import * as React from "react"

interface WorldPopulationCounterProps {
  label: string
}

const startValue = 7794798739 //value on 1 January 2020
const yearlyGrowRate = 0.0105

const calculatePopulation = (): number => {
  const deltaValue = startValue * yearlyGrowRate
  const time = new Date().getTime() - new Date(2020, 7, 1, 0, 0, 0, 0).getTime()
  const actualPop = startValue + deltaValue * (time / (365 * 86400 * 1000))

  return parseInt(actualPop.toString(), 10) //calcolo da sistemare
}

export const WorldPopulationCounter: React.FC<WorldPopulationCounterProps> = (
  props
) => {
  const [, $theme] = themedUseStyletron()
  const [worldPopulation, setWorldPopulation] = React.useState(
    calculatePopulation()
  )

  React.useEffect(() => {
    const countdownTimer = setTimeout(() => {
      setWorldPopulation(calculatePopulation())
    }, 500)
    return () => clearTimeout(countdownTimer)
  })

  return (
    <div style={{ color: "white", textAlign: "center" }}>
      <div
        style={{
          fontSize: 180,
          fontWeight: $theme.typography.font400.fontWeight,
          fontFamily: $theme.typography.thirdaryFont,
        }}
      >
        {worldPopulation}
      </div>
      <ParagraphMedium font={$theme.typography.thirdaryFont} color="white">
        {props.label}
      </ParagraphMedium>
    </div>
  )
}
