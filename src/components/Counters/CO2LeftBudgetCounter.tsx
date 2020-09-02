import moment from "moment"
import * as React from "react"
import { Counter } from "./Counter"

const END_DATE = new Date(2029, 11, 31)
const calculateTimeLeft = (): number => {
  const now = new Date()
  return moment(END_DATE).diff(moment(now), "s")
}

export const CO2LeftBudgetCounter: React.FC = (
  
) => {
  return (
    <Counter
      getCount={calculateTimeLeft}
      message={
        "Secondi che ci rimangono per poter mantenere l'innalzamento della temperatura globale entro il 1.5ºC"
      }
      sources={[]}
    />
  )
}
