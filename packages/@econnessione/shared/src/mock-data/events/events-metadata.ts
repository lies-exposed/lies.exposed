import { Events } from "@io/http";
import { badActor, goodActor } from "@mock-data/actors";
import { badGroup, goodGroup, secondBadGroup } from "@mock-data/groups";
import { thirdImage } from "@mock-data/images";
import { firstBadProject, firstGoodProject } from "@mock-data/projects";
import { firstFund, secondFund, thirdFund } from "@mock-data/transactions";
import { uuid } from "@utils/uuid";
import { subDays } from "date-fns";
import * as O from "fp-ts/lib/Option";

const now = new Date();

export const firstEventMetadata: Events.Event[] = [
  {
    id: uuid(),
    title: "",
    type: "ProjectTransaction",
    transaction: firstFund.id,
    project: firstBadProject.id,
    date: subDays(now, 20),
    createdAt: subDays(now, 1),
    updatedAt: subDays(now, 1),
  },
  {
    id: uuid(),
    type: "Protest",
    title: "Protest for bad project",
    for: { type: "Project", project: firstBadProject },
    organizers: [{ type: "Group", group: goodGroup.id }],
    images: O.none,
    date: subDays(now, 14),
    createdAt: subDays(now, 1),
    updatedAt: subDays(now, 1),
  },
  {
    id: uuid(),
    title: "",
    type: "PublicAnnouncement",
    from: [{ type: "Group", group: badGroup.id }],
    publishedBy: [{ type: "Group", group: badGroup.id }],
    // for: { type: "Project", project: firstBadProject },
    date: subDays(now, 13),
    createdAt: subDays(now, 1),
    updatedAt: subDays(now, 1),
  },
  {
    id: uuid(),
    date: subDays(now, 13),
    title: "",
    type: "ProjectImpact",
    approvedBy: [{ type: "Group", group: badGroup.id }],
    executedBy: [{ type: "Group", group: secondBadGroup.id }],
    images: [],
    impact: { type: "CO2Emitted", amount: 300, unit: "gt" },
    project: firstBadProject.id,
    createdAt: subDays(now, 1),
    updatedAt: subDays(now, 1),
  },
  {
    id: uuid(),
    title: "",
    type: "Arrest",
    who: {
      type: "Actor",
      actor: badActor.id,
    },
    for: [{ type: "Project", project: firstBadProject }],
    date: subDays(now, 7),
    createdAt: subDays(now, 1),
    updatedAt: subDays(now, 1),
  },
];

export const secondEventMetadata: Events.Event[] = [
  // {
  //   id: uuid(),
  //   title: "",
  //   type: "StudyPublished",
  //   from: [
  //     {
  //       type: "Actor",
  //       actor: goodSecondActor.id,
  //     },
  //   ],
  //   date: subDays(now, 30),
  //   source: "http://source.to.study",
  //   createdAt: subDays(now, 1),
  //   updatedAt: subDays(now, 1),
  // },
  {
    id: uuid(),
    type: "Death",
    victim: goodActor.id,
    killer: undefined,
    location: undefined,
    suspects: [],
    news: [],
    images: [],
    date: subDays(now, 22),
    createdAt: subDays(now, 2),
    updatedAt: subDays(now, 2),
  },
];

export const thirdEventMetadata: Events.Event[] = [
  {
    title: "",
    id: uuid(),
    type: "ProjectTransaction",
    transaction: secondFund.id,
    project: firstGoodProject.id,
    date: subDays(now, 10),
    createdAt: subDays(now, 1),
    updatedAt: subDays(now, 1),
  },
  {
    title: "",
    id: uuid(),
    type: "ProjectTransaction",
    transaction: firstFund.id,
    project: firstBadProject.id,
    date: subDays(now, 10),
    createdAt: subDays(now, 1),
    updatedAt: subDays(now, 1),
  },
  {
    title: "",
    id: uuid(),
    type: "ProjectTransaction",
    transaction: thirdFund.id,
    project: firstBadProject.id,
    date: subDays(now, 10),
    createdAt: subDays(now, 1),
    updatedAt: subDays(now, 1),
  },
  {
    id: uuid(),
    type: "Protest",
    title: "Second protest form bad project",
    organizers: [
      {
        type: "Actor",
        actor: goodActor.id,
      },
    ],
    for: { type: "Project", project: firstBadProject },
    images: O.none,
    date: subDays(now, 8),
    createdAt: subDays(now, 1),
    updatedAt: subDays(now, 1),
  },
];

export const fourthEventMetadata: Events.Event[] = [
  {
    id: uuid(),
    type: "Protest",
    title: "Protest for good project",
    organizers: [{ type: "Group", group: goodGroup.id }],
    for: { type: "Project", project: firstGoodProject },
    images: O.some([
      {
        author: "Unknown",
        description: "Protest image",
        location: thirdImage.location,
      },
    ]),
    date: subDays(now, 5),
    createdAt: subDays(now, 1),
    updatedAt: subDays(now, 1),
  },
];

export const eventMetadata: Events.Event[] = [
  ...firstEventMetadata,
  ...secondEventMetadata,
  ...thirdEventMetadata,
  ...fourthEventMetadata,
];

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
};
