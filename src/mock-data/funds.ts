import { TransactionFrontmatter } from "@models/Transaction"
import uuid from "@utils/uuid"
import { subYears } from "date-fns"
import { goodActor, badActor, goodSecondActor } from "./actors"
import { badGroup, goodGroup } from "./groups"

export const firstFund: TransactionFrontmatter = {
  uuid: uuid(),
  amount: 100000,
  by: { __type: "Actor", actor: goodActor },
  to: { __type: 'Actor', actor: goodSecondActor},
  date: subYears(new Date(), 1),
  createdAt: new Date(),
  sources: ["first source"],
}

export const secondFund: TransactionFrontmatter = {
  uuid: uuid(),
  amount: 40000,
  by: { __type: "Actor", actor: badActor },
  to: { __type: "Group", group: badGroup },
  date: subYears(new Date(), 1),
  createdAt: new Date(),
  sources: ["second source"],
}

export const thirdFund: TransactionFrontmatter = {
  uuid: uuid(),
  amount: 150000,
  by: { __type: "Group", group: goodGroup },
  to: { __type: "Group", group: badGroup },
  date: subYears(new Date(), 1),
  createdAt: new Date(),
  sources: ["third sources"],
}

export const fourthFund: TransactionFrontmatter = {
  uuid: uuid(),
  amount: 200000,
  by: { __type: "Group", group: goodGroup },
  to: { __type: "Actor", actor: goodActor },
  date: subYears(new Date(), 1),
  createdAt: new Date(),
  sources: ["third sources"],
}

export const fifthFund: TransactionFrontmatter = {
  uuid: uuid(),
  amount: 200000,
  by: { __type: "Actor", actor: goodActor },
  to: { __type: "Actor", actor: goodSecondActor },
  date: subYears(new Date(), 1),
  createdAt: new Date(),
  sources: ["third sources"],
}

export const funds: TransactionFrontmatter[] = [
  firstFund,
  secondFund,
  thirdFund,
  fourthFund,
  fifthFund,
]
