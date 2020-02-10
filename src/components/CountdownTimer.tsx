import moment from "moment"
import * as React from "react"

const calculateTimeLeft = (): number => {
  const now = new Date()
  const endDate = new Date(2028, 1, 1)
  return moment(endDate).diff(moment(now), "s")
}

export const CountdownTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = React.useState(calculateTimeLeft())

  React.useEffect(() => {
    const countdownTimer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)
    return () => clearTimeout(countdownTimer)
  })

  return (
    <div
      className="title"
      style={{ fontFamily: "monospaced", fontSize: 160, color: "#fff" }}
    >
      {timeLeft}*
    </div>
  )
}
