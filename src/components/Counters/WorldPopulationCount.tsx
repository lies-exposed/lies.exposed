import { themedUseStyletron } from "@theme/CustomeTheme"
import { ParagraphMedium } from "baseui/typography"
import * as React from "react"

interface WorldPopulationCounterProps {
  count: number
  label: string
}
export const WorldPopulationCounter: React.FC<WorldPopulationCounterProps> = props => {
  const [, $theme] = themedUseStyletron()

  return (
    <div style={{ color: "white", textAlign: "center" }}>
      <div
        style={{
          fontSize: 60,
          fontFamily: $theme.typography.thirdaryFont,
        }}
      >
        {props.count}
      </div>
      <ParagraphMedium font={$theme.typography.thirdaryFont} color="white">
        {props.label}
      </ParagraphMedium>
    </div>
  )
}
