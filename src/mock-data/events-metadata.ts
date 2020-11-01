import { EventFrontmatter, EventListMap } from "@models/events/EventMetadata"
import uuid from "@utils/uuid"
import { subDays } from "date-fns"
import * as O from "fp-ts/lib/Option"
import { badActor, goodActor, goodSecondActor } from "./actors"
import { firstFund, secondFund, thirdFund } from "./funds"
import { badGroup, goodGroup, secondBadGroup } from "./groups"
import { thirdImage } from "./images"
import { firstBadProject, firstGoodProject } from "./projects"

const now = new Date()

export const firstEventMetadata: EventFrontmatter[] = [
  {
    uuid: uuid(),
    type: "ProjectTransaction",
    transaction: firstFund,
    project: firstBadProject,
    date: subDays(now, 20),
    createdAt: subDays(now, 1),
    updatedAt: subDays(now, 1)
  },
  {
    uuid: uuid(),
    type: "Protest",
    for: { __type: "ForProject", project: firstBadProject },
    by: [{ __type: "Group", group: goodGroup }],
    images: O.none,
    date: subDays(now, 14),
    createdAt: subDays(now, 1),
    updatedAt: subDays(now, 1)
  },
  {
    type: "PublicAnnouncement",
    by: [{ __type: "Group", group: badGroup }],
    publishedBy: [{ __type: "Group", group: badGroup }],
    for: { __type: "ForProject", project: firstBadProject },
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
    for: [{ __type: "ForProject", project: firstBadProject }],
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
    uuid: uuid(),
    type: "ProjectTransaction",
    transaction: secondFund,
    project: firstGoodProject,
    date: subDays(now, 10),
    createdAt: subDays(now, 1),
    updatedAt: subDays(now, 1)
  },
  {
    uuid: uuid(),
    type: "ProjectTransaction",
    transaction: firstFund,
    project: firstBadProject,
    date: subDays(now, 10),
    createdAt: subDays(now, 1),
    updatedAt: subDays(now, 1)
  },
  {
    uuid: uuid(),
    type: "ProjectTransaction",
    transaction: thirdFund,
    project: firstBadProject,
    date: subDays(now, 10),
    createdAt: subDays(now, 1),
    updatedAt: subDays(now, 1)
  },
  {
    uuid: uuid(),
    type: "Protest",
    by: [{ __type: "Actor", actor: goodActor }],
    for: { __type: "ForProject", project: firstBadProject },
    images: O.none,
    date: subDays(now, 8),
    createdAt: subDays(now, 1),
    updatedAt: subDays(now, 1)
  },
]

export const fourthEventMetadata: EventFrontmatter[] = [
  {
    uuid: uuid(),
    type: "Protest",
    by: [{ __type: "Group", group: goodGroup }],
    for: { __type: "ForProject", project: firstGoodProject },
    images: O.some([{
      author: 'Unknown',
      description: O.some('Protest image'),
      image: thirdImage
    }]),
    date: subDays(now, 5),
    createdAt: subDays(now, 1),
    updatedAt: subDays(now, 1)
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
  ProjectTransaction: [],
  ProjectImpact: [],
  Protest: [],
  StudyPublished: [],
  Arrest: [],
  Death: [],
  Condamned: [],
  Uncategorized: [],
}
