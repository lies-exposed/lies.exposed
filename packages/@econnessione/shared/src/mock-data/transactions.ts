import { Transaction } from "@io/http";
import uuid from "@utils/uuid";
import { subYears } from "date-fns";
import { badActor, goodActor, goodSecondActor } from "./actors";
import { badGroup, goodGroup } from "./groups";

export const firstFund: Transaction.TransactionFrontmatter = {
  id: uuid(),
  type: Transaction.TRANSACTION_FRONTMATTER.value,
  amount: 100000,
  by: { type: "Actor", actor: goodActor.id },
  to: { type: "Actor", actor: goodSecondActor.id },
  date: subYears(new Date(), 1),
  createdAt: new Date(),
  updatedAt: new Date(),
  sources: ["first source"],
};

export const secondFund: Transaction.TransactionFrontmatter = {
  id: uuid(),
  type: Transaction.TRANSACTION_FRONTMATTER.value,
  amount: 40000,
  by: { type: "Actor", actor: badActor.id },
  to: { type: "Group", group: badGroup.id },
  date: subYears(new Date(), 1),
  createdAt: new Date(),
  updatedAt: new Date(),
  sources: ["second source"],
};

export const thirdFund: Transaction.TransactionFrontmatter = {
  id: uuid(),
  type: Transaction.TRANSACTION_FRONTMATTER.value,
  amount: 150000,
  by: { type: "Group", group: goodGroup.id },
  to: { type: "Group", group: badGroup.id },
  date: subYears(new Date(), 1),
  createdAt: new Date(),
  updatedAt: new Date(),
  sources: ["third sources"],
};

export const fourthFund: Transaction.TransactionFrontmatter = {
  id: uuid(),
  type: Transaction.TRANSACTION_FRONTMATTER.value,
  amount: 200000,
  by: { type: "Group", group: goodGroup.id },
  to: { type: "Actor", actor: goodActor.id },
  date: subYears(new Date(), 1),
  createdAt: new Date(),
  updatedAt: new Date(),
  sources: ["third sources"],
};

export const fifthFund: Transaction.TransactionFrontmatter = {
  id: uuid(),
  type: Transaction.TRANSACTION_FRONTMATTER.value,
  amount: 200000,
  by: { type: "Actor", actor: goodActor.id },
  to: { type: "Actor", actor: goodSecondActor.id },
  date: subYears(new Date(), 1),
  createdAt: new Date(),
  updatedAt: new Date(),
  sources: ["third sources"],
};

export const funds: Transaction.TransactionFrontmatter[] = [
  firstFund,
  secondFund,
  thirdFund,
  fourthFund,
  fifthFund,
];
