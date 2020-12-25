import { Events } from "@econnessione/io"
import { badActor, goodActor, goodSecondActor } from "@mock-data/actors"
import { badGroup, goodGroup, secondBadGroup } from "@mock-data/groups"
import { thirdImage } from "@mock-data/images"
import { firstBadProject, firstGoodProject } from "@mock-data/projects"
import { firstFund, secondFund, thirdFund } from "@mock-data/transactions"
import uuid from "@utils/uuid"
import { subDays } from "date-fns"
import * as O from "fp-ts/lib/Option"

const now = new Date()

export const firstEventMetadata: Events.EventFrontmatter[] = [
  {
    id: uuid(),
    title: "",
    type: "ProjectTransaction",
    transaction: firstFund,
    project: firstBadProject,
    date: subDays(now, 20),
    createdAt: subDays(now, 1),
    updatedAt: subDays(now, 1),
  },
  {
    id: uuid(),
    type: "Protest",
    title: "Protest for bad project",
    for: { type: "Project", project: firstBadProject },
    organizers: [{ type: "Group", group: goodGroup }],
    images: O.none,
    date: subDays(now, 14),
    createdAt: subDays(now, 1),
    updatedAt: subDays(now, 1),
  },
  {
    id: uuid(),
    title: "",
    type: "PublicAnnouncement",
    from: [{ type: "Group", group: badGroup }],
    publishedBy: [{ type: "Group", group: badGroup }],
    // for: { type: "Project", project: firstBadProject },
    date: subDays(now, 13),
    createdAt: subDays(now, 1),
    updatedAt: subDays(now, 1)
  },
  {
    id: uuid(),
    date: subDays(now, 13),
    title: "",
    type: "ProjectImpact",
    approvedBy: [{ type: "Group", group: badGroup }],
    executedBy: [{ type: "Group", group: secondBadGroup }],
    images: [],
    impact: { type: 'CO2Emitted', amount: 300, unit: "gt" },
    project: firstBadProject,
    createdAt: subDays(now, 1),
    updatedAt: subDays(now, 1)
  },
  {
    id: uuid(),
    title: "",
    type: "Arrest",
    who: { type: "Actor", actor: badActor },
    for: [{ type: "Project", project: firstBadProject }],
    date: subDays(now, 7),
    createdAt: subDays(now, 1),
    updatedAt: subDays(now, 1)
  },
]

export const secondEventMetadata: Events.EventFrontmatter[] = [
  {
    id: uuid(),
    title: "",
    type: "StudyPublished",
    from: [{ type: "Actor", actor: goodSecondActor }],
    date: subDays(now, 30),
    source: "http://source.to.study",
    createdAt: subDays(now, 1),
    updatedAt: subDays(now, 1)
  },
  {
    id: uuid(),
    title: "",
    type: "Death",
    who: { type: "Actor", actor: goodActor },
    killer: O.none,
    date: subDays(now, 22),
    createdAt: subDays(now, 2),
    updatedAt: subDays(now, 2)
  },
]

export const thirdEventMetadata: Events.EventFrontmatter[] = [
  {
    title: "",
    id: uuid(),
    type: "ProjectTransaction",
    transaction: secondFund,
    project: firstGoodProject,
    date: subDays(now, 10),
    createdAt: subDays(now, 1),
    updatedAt: subDays(now, 1),
  },
  {
    title: "",
    id: uuid(),
    type: "ProjectTransaction",
    transaction: firstFund,
    project: firstBadProject,
    date: subDays(now, 10),
    createdAt: subDays(now, 1),
    updatedAt: subDays(now, 1),
  },
  {
    title: "",
    id: uuid(),
    type: "ProjectTransaction",
    transaction: thirdFund,
    project: firstBadProject,
    date: subDays(now, 10),
    createdAt: subDays(now, 1),
    updatedAt: subDays(now, 1),
  },
  {
    id: uuid(),
    type: "Protest",
    title: "Second protest form bad project",
    organizers: [{ type: "Actor", actor: goodActor }],
    for: { type: "Project", project: firstBadProject },
    images: O.none,
    date: subDays(now, 8),
    createdAt: subDays(now, 1),
    updatedAt: subDays(now, 1),
  },
]

export const fourthEventMetadata: Events.EventFrontmatter[] = [
  {
    id: uuid(),
    type: "Protest",
    title: "Protest for good project",
    organizers: [{ type: "Group", group: goodGroup }],
    for: { type: "Project", project: firstGoodProject },
    images: O.some([
      {
        author: "Unknown",
        description: O.some("Protest image"),
        image: thirdImage,
      },
    ]),
    date: subDays(now, 5),
    createdAt: subDays(now, 1),
    updatedAt: subDays(now, 1),
  },
]

export const eventMetadata: Events.EventFrontmatter[] = [
  ...firstEventMetadata,
  ...secondEventMetadata,
  ...thirdEventMetadata,
  ...fourthEventMetadata,
]

export const eventMetadataMapEmpty = {
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
