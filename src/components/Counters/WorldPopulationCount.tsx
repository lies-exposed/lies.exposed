import { themedUseStyletron } from "@theme/CustomeTheme"
import { ParagraphMedium } from "baseui/typography"
import * as React from "react"

interface WorldPopulationCounterProps {
  count: number
  label: string
}

const calculatePopulation = () : number => {
  const startValue = 7621018958; //value on 1 January 2020
  const yearlyGrowRate = 0.0105;
  const time = new Date().getTime() - new Date(2020,1,1,0,0,0,0).getTime();
  const msRate = yearlyGrowRate / (365*86400*1000);
  
  return parseInt((startValue*Math.pow(2.71828,msRate*time)).toString()); //calcolo da sistemare

}

export const WorldPopulationCounter: React.FC<WorldPopulationCounterProps> = props => {
  const [, $theme] = themedUseStyletron()
  const [worldPopulation, setWorldPopulation] = React.useState(calculatePopulation())

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
          fontSize: 60,
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
