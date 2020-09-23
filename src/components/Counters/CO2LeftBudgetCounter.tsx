import moment from "moment"
import * as React from "react"
import { Counter } from "./Counter"

const END_DATE = new Date(2027, 11, 31)
const calculateTimeLeft = (): string => {
  const now = new Date()
  const diffTime = END_DATE.getTime() - now.getTime()
  const duration = moment.duration(diffTime, 'milliseconds')
  return `${duration.years()} anni, ${duration.months()} mesi, ${duration.days()} giorni, ${duration.hours()} ore, ${duration.minutes()} minuti, ${duration.seconds()} secondi`
}

export const CO2LeftBudgetCounter: React.FC = () => {
  return (
    <Counter
      getCount={calculateTimeLeft}
      sources={[]}
    />
  )
}
