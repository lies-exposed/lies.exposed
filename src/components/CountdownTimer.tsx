import { ParagraphMedium } from "baseui/typography"
import moment from "moment"
import * as React from "react"

const calculateTimeLeft = (): number => {
  const now = new Date()
  const endDate = new Date(2028, 1, 1)
  return moment(endDate).diff(moment(now), "s")
}

interface CountdownTimerProps {
  message?: string
}
export const CountdownTimer: React.FC<CountdownTimerProps> = props => {
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
          fontFamily: '"Lucida Console", Monaco, monospace',
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
