import { TransactionFrontmatter, TRANSACTION_FRONTMATTER } from "@models/Transaction"
import uuid from "@utils/uuid"
import { subYears } from "date-fns"
import { goodActor, badActor, goodSecondActor } from "./actors"
import { badGroup, goodGroup } from "./groups"

export const firstFund: TransactionFrontmatter = {
  uuid: uuid(),
  type: TRANSACTION_FRONTMATTER.value,
  amount: 100000,
  by: { type: "Actor", actor: goodActor },
  to: { type: 'Actor', actor: goodSecondActor},
  date: subYears(new Date(), 1),
  createdAt: new Date(),
  updatedAt: new Date(),
  sources: ["first source"],
}

export const secondFund: TransactionFrontmatter = {
  uuid: uuid(),
  type: TRANSACTION_FRONTMATTER.value,
  amount: 40000,
  by: { type: "Actor", actor: badActor },
  to: { type: "Group", group: badGroup },
  date: subYears(new Date(), 1),
  createdAt: new Date(),
  updatedAt: new Date(),
  sources: ["second source"],
}

export const thirdFund: TransactionFrontmatter = {
  uuid: uuid(),
  type: TRANSACTION_FRONTMATTER.value,
  amount: 150000,
  by: { type: "Group", group: goodGroup },
  to: { type: "Group", group: badGroup },
  date: subYears(new Date(), 1),
  createdAt: new Date(),
  updatedAt: new Date(),
  sources: ["third sources"],
}

export const fourthFund: TransactionFrontmatter = {
  uuid: uuid(),
  type: TRANSACTION_FRONTMATTER.value,
  amount: 200000,
  by: { type: "Group", group: goodGroup },
  to: { type: "Actor", actor: goodActor },
  date: subYears(new Date(), 1),
  createdAt: new Date(),
  updatedAt: new Date(),
  sources: ["third sources"],
}

export const fifthFund: TransactionFrontmatter = {
  uuid: uuid(),
  type: TRANSACTION_FRONTMATTER.value,
  amount: 200000,
  by: { type: "Actor", actor: goodActor },
  to: { type: "Actor", actor: goodSecondActor },
  date: subYears(new Date(), 1),
  createdAt: new Date(),
  updatedAt: new Date(),
  sources: ["third sources"],
}

export const funds: TransactionFrontmatter[] = [
  firstFund,
  secondFund,
  thirdFund,
  fourthFund,
  fifthFund,
]
