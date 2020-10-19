import { FundFrontmatter } from "@models/Fund"
import uuid from "@utils/uuid"
import { subYears } from "date-fns"
import { goodActor, badActor } from "./actors"
import { goodGroup } from "./groups"
import { firstGoodProject, firstBadProject } from "./projects"

export const firstFund: FundFrontmatter = {
  uuid: uuid(),
  amount: 100000,
  __type: "Fund",
  project: firstGoodProject,
  by: { __type: "Actor", actor: goodActor },
  date: subYears(new Date(), 1),
  createdAt: new Date(),
  sources: ["first source"],
}

export const secondFund: FundFrontmatter = {
  uuid: uuid(),
  amount: 40000,
  __type: "Fund",
  project: firstBadProject,
  by: { __type: "Actor", actor: badActor },
  date: subYears(new Date(), 1),
  createdAt: new Date(),
  sources: ["second source"]
}

export const thirdFund: FundFrontmatter = {
  uuid: uuid(),
  amount: 150000,
  __type: 'Fund',
  project: firstGoodProject,
  by: { __type: "Group", group: goodGroup },
  date: subYears(new Date(), 1),
  createdAt: new Date(),
  sources: ["third sources"]
}

export const fourthFund: FundFrontmatter = {
  uuid: uuid(),
  amount: 200000,
  __type: 'Fund',
  project: firstGoodProject,
  by: { __type: "Group", group: goodGroup },
  date: subYears(new Date(), 1),
  createdAt: new Date(),
  sources: ["third sources"]
}

export const fifthFund: FundFrontmatter = {
  uuid: uuid(),
  amount: 200000,
  __type: 'Fund',
  project: firstGoodProject,
  by: { __type: "Actor", actor: goodActor },
  date: subYears(new Date(), 1),
  createdAt: new Date(),
  sources: ["third sources"]
}

export const funds: FundFrontmatter[] = [firstFund, secondFund, thirdFund, fourthFund, fifthFund]
