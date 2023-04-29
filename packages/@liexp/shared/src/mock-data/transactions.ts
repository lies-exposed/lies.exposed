import { subYears } from "date-fns";
import * as Transaction from "../io/http/Events/Transaction";
import { uuid } from "../utils/uuid";
import { badActor, goodActor, goodSecondActor } from "./actors";
import { badGroup, goodGroup } from "./groups";

export const firstFund: Transaction.Transaction = {
  id: uuid() as any,
  type: Transaction.TRANSACTION.value,
  payload: {
    title: "employment",
    total: 100000,
    currency: "euro",
    from: { type: "Actor", id: goodActor.id },
    to: { type: "Actor", id: goodSecondActor.id },
  },
  date: subYears(new Date(), 1),
  createdAt: new Date(),
  updatedAt: new Date(),
  draft: false,
  excerpt: undefined,
  body: undefined,
  links: [],
  media: [],
  keywords: [],
  deletedAt: undefined
};

export const secondFund: Transaction.Transaction = {
  id: uuid() as any,
  type: Transaction.TRANSACTION.value,
  payload: {
    title: "media coverage",
    total: 40000,
    currency: "euro",
    from: { type: "Actor", id: badActor.id },
    to: { type: "Group", id: badGroup.id },
  },
  date: subYears(new Date(), 1),
  createdAt: new Date(),
  updatedAt: new Date(),
  draft: false,
  excerpt: undefined,
  body: undefined,
  links: [],
  media: [],
  keywords: [],
  deletedAt: undefined,
};

export const thirdFund: Transaction.Transaction = {
  id: uuid() as any,
  type: Transaction.TRANSACTION.value,
  payload: {
    title: "cinema",
    total: 150000,
    currency: "euro",
    from: { type: "Group", id: goodGroup.id },
    to: { type: "Group", id: badGroup.id },
  },
  date: subYears(new Date(), 1),
  createdAt: new Date(),
  updatedAt: new Date(),
  draft: false,
  excerpt: undefined,
  body: undefined,
  links: [],
  media: [],
  keywords: [],
  deletedAt: undefined,
};

export const fourthFund: Transaction.Transaction = {
  id: uuid() as any,
  type: Transaction.TRANSACTION.value,

  payload: {
    title: "transaction title",
    total: 200000,
    currency: "dollar",
    from: { type: "Group", id: goodGroup.id },
    to: { type: "Actor", id: goodActor.id },
  },
  date: subYears(new Date(), 1),
  createdAt: new Date(),
  updatedAt: new Date(),
  draft: false,
  excerpt: undefined,
  body: undefined,
  links: [],
  media: [],
  keywords: [],
  deletedAt: undefined,
};

export const fifthFund: Transaction.Transaction = {
  id: uuid() as any,
  type: Transaction.TRANSACTION.value,
  payload: {
    title: "dasdsa",
    total: 200000,
    currency: "euro",
    from: { type: "Actor", id: goodActor.id },
    to: { type: "Actor", id: goodSecondActor.id },
  },
  date: subYears(new Date(), 1),
  createdAt: new Date(),
  updatedAt: new Date(),
  draft: false,
  excerpt: undefined,
  body: undefined,
  links: [],
  media: [],
  keywords: [],
  deletedAt: undefined,
};

export const funds: Transaction.Transaction[] = [
  firstFund,
  secondFund,
  thirdFund,
  fourthFund,
  fifthFund,
];
