import { FundFrontmatter } from "@models/events/Fund"
import uuid from "@utils/uuid"
import { subYears } from "date-fns"
import { firstActor, secondActor } from "./actors"
import { firstGroup } from "./groups"
import { firstProject, secondProject } from "./projects"

export const firstFund: FundFrontmatter = {
  uuid: uuid(),
  amount: 100000,
  type: "Fund",
  project: firstProject,
  by: { __type: "Actor", actor: firstActor },
  date: subYears(new Date(), 1),
  createdAt: new Date(),
  sources: ["first source"],
}

export const secondFund: FundFrontmatter = {
  uuid: uuid(),
  amount: 40000,
  type: "Fund",
  project: firstProject,
  by: { __type: "Actor", actor: secondActor },
  date: subYears(new Date(), 1),
  createdAt: new Date(),
  sources: ["second source"]
}

export const thirdFund: FundFrontmatter = {
  uuid: uuid(),
  amount: 150000,
  type: 'Fund',
  project: firstProject,
  by: { __type: "Group", group: firstGroup },
  date: subYears(new Date(), 1),
  createdAt: new Date(),
  sources: ["third sources"]
}

export const fourthFund: FundFrontmatter = {
  uuid: uuid(),
  amount: 200000,
  type: 'Fund',
  project: firstProject,
  by: { __type: "Group", group: firstGroup },
  date: subYears(new Date(), 1),
  createdAt: new Date(),
  sources: ["third sources"]
}

export const fifthFund: FundFrontmatter = {
  uuid: uuid(),
  amount: 200000,
  type: 'Fund',
  project: secondProject,
  by: { __type: "Actor", actor: firstActor },
  date: subYears(new Date(), 1),
  createdAt: new Date(),
  sources: ["third sources"]
}

export const funds: FundFrontmatter[] = [firstFund, secondFund, thirdFund, fourthFund, fifthFund]
