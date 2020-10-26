import { EventFrontmatter, EventListMap } from "@models/events/EventMetadata"
import { subDays } from "date-fns"
import * as O from "fp-ts/lib/Option"
import { badActor, goodActor, goodSecondActor, badSecondActor } from "./actors"
import { badGroup, goodGroup, secondBadGroup } from "./groups"
import { firstBadProject, firstGoodProject } from "./projects"

const now = new Date()

export const firstEventMetadata: EventFrontmatter[] = [
  {
    type: "ProjectFund",
    by: { __type: "Group", group: badGroup },
    amount: 1000000,
    project: firstBadProject,
    date: subDays(now, 20),
  },
  {
    type: "Protest",
    for: { __type: "ForProject", uuid: firstBadProject.uuid },
    by: [{ __type: "Group", group: goodGroup }],
    images: O.none,
    date: subDays(now, 14),
  },
  {
    type: "PublicAnnouncement",
    by: [{ __type: "Group", group: badGroup }],
    publishedBy: [{ __type: "Group", group: badGroup }],
    date: subDays(now, 13),
  },
  {
    type: "ProjectImpact",
    approvedBy: [{ __type: "Group", group: badGroup }],
    executedBy: [{ __type: "Group", group: secondBadGroup }],
    images: [],
    impact: { amount: 300, unit: "gt" },
    project: firstBadProject,
  },
  {
    type: "Arrest",
    who: { __type: "Actor", actor: badActor },
    for: [{ __type: "ForProject", uuid: firstBadProject.uuid }],
    date: subDays(now, 7),
  },
]

export const secondEventMetadata: EventFrontmatter[] = [
  {
    type: "StudyPublished",
    by: [{ __type: "Actor", actor: goodSecondActor }],
    date: subDays(now, 30),
    source: "http://source.to.study",
  },
  {
    type: "Death",
    who: { __type: "Actor", actor: goodActor },
    killer: O.none,
    date: subDays(now, 22),
  },
]

export const thirdEventMetadata: EventFrontmatter[] = [
  {
    type: "ProjectFund",
    by: { __type: "Actor", actor: goodActor },
    amount: 350000,
    project: firstGoodProject,
    date: subDays(now, 10),
  },
  {
    type: "ProjectFund",
    by: { __type: "Group", group: badActor },
    amount: 100000,
    project: firstBadProject,
    date: subDays(now, 10),
  },
  {
    type: "ProjectFund",
    by: { __type: "Actor", actor: badSecondActor },
    amount: 100000,
    project: firstBadProject,
    date: subDays(now, 10),
  },
  {
    type: "Protest",
    by: [{ __type: "Actor", actor: goodActor }],
    for: { __type: "ForProject", uuid: firstBadProject.uuid },
    images: O.none,
    date: subDays(now, 8),
  },
]

export const fourthEventMetadata: EventFrontmatter[] = [
  {
    type: "Protest",
    by: [{ __type: "Group", group: goodGroup }],
    for: { __type: "ForProject", uuid: firstGoodProject.uuid },
    images: O.none,
    date: subDays(now, 5),
  },
]

export const eventMetadata: EventFrontmatter[] = [
  ...firstEventMetadata,
  ...secondEventMetadata,
  ...thirdEventMetadata,
  ...fourthEventMetadata,
]

export const eventMetadataMapEmpty: EventListMap = {
  PublicAnnouncement: [],
  ProjectFund: [],
  ProjectImpact: [],
  Protest: [],
  StudyPublished: [],
  Arrest: [],
  Death: [],
  Condamned: [],
  Uncategorized: [],
}
