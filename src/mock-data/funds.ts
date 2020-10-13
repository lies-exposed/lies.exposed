import { Fund } from "@models/events/Fund"
import uuid from "@utils/uuid"
import { subYears } from "date-fns"
import { firstActor, secondActor } from "./actors"
import { firstGroup } from "./groups"

export const firstFund: Fund = {
  uuid: uuid(),
  amount: 100000,
  by: { __type: 'Actor', actor: firstActor },
  date: subYears(new Date(), 1),
  createdAt: new Date(),
}

export const secondFund: Fund = {
  uuid: uuid(),
  amount: 40000,
  by: { __type: 'Actor', actor: secondActor },
  date: subYears(new Date(), 1),
  createdAt: new Date(),
}

export const thirdFund: Fund = {
  uuid: uuid(),
  amount: 150000,
  by: { __type: 'Group', group: firstGroup },
  date: subYears(new Date(), 1),
  createdAt: new Date(),
}

export const funds: Fund[] = [firstFund, secondFund, thirdFund]