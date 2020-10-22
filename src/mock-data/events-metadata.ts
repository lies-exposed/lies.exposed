import { EventMetadata } from "@models/EventMetadata"
import { subDays } from "date-fns"
import * as O from "fp-ts/lib/Option"
import { badActor, goodActor, goodSecondActor } from "./actors"
import { badGroup, goodGroup, secondBadGroup } from "./groups"
import { firstBadProject } from "./projects"

const now = new Date()

export const firstMetadata: EventMetadata[] = [
  {
    type: "ProjectFund",
    by: [{ __type: "Group", group: badGroup }],
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

export const secondMetadata: EventMetadata[] = [
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
