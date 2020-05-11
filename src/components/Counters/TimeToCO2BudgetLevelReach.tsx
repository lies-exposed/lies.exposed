import { themedUseStyletron} from '@theme/CustomeTheme'
import { ParagraphMedium } from "baseui/typography"
import moment from "moment"
import * as React from "react"

const END_DATE = new Date(2030, 11, 31)
const calculateTimeLeft = (): number => {
  const now = new Date()  
  return moment(END_DATE).diff(moment(now), "s")
}

interface TimeToCO2BudgetLevelReachProps {
  message?: string
}
export const TimeToCO2BudgetLevelReach: React.FC<TimeToCO2BudgetLevelReachProps> = props => {
  const [, $theme] = themedUseStyletron()
  const [timeLeft, setTimeLeft] = React.useState(calculateTimeLeft())

  React.useEffect(() => {
    const countdownTimer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)
    return () => clearTimeout(countdownTimer)
  })

  return (
    <div style={{ color: "white", textAlign: "center" }}>
      <div
        style={{
          fontSize: 160,
          fontFamily: $theme.typography.thirdaryFont
        }}
      >
        {timeLeft}
        {props.message !== undefined ? "*" : ""}
      </div>
      {props.message !== undefined ? (
        <ParagraphMedium color="white">{`* ${props.message}`}</ParagraphMedium>
      ) : null}
    </div>
  )
}
