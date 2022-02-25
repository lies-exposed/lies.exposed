import { subDays } from "date-fns";
import { Events } from "../../io/http";
import { uuid } from "../../utils/uuid";
import { goodActor } from "../actors";

const now = new Date();

export const firstEventMetadata: Events.Event[] = [];
// export const firstEventMetadata: Events.Event[] = [
//   {
//     id: uuid() as any,
//     title: "",
//     type: "ProjectTransaction",
//     transaction: firstFund.id,
//     project: firstBadProject.id,
//     date: subDays(now, 20),
//     createdAt: subDays(now, 1),
//     updatedAt: subDays(now, 1),
//   },
//   {
//     id: uuid() as any,
//     type: "Protest",
//     title: "Protest for bad project",
//     for: { type: "Project", project: firstBadProject },
//     organizers: [{ type: "Group", group: goodGroup.id }],
//     media: O.none,
//     date: subDays(now, 14),
//     createdAt: subDays(now, 1),
//     updatedAt: subDays(now, 1),
//   },
//   {
//     id: uuid() as any,
//     title: "",
//     type: "PublicAnnouncement",
//     from: [{ type: "Group", group: badGroup.id }],
//     publishedBy: [{ type: "Group", group: badGroup.id }],
//     // for: { type: "Project", project: firstBadProject },
//     date: subDays(now, 13),
//     createdAt: subDays(now, 1),
//     updatedAt: subDays(now, 1),
//   },
//   {
//     id: uuid() as any,
//     date: subDays(now, 13),
//     title: "",
//     type: "ProjectImpact",
//     approvedBy: [{ type: "Group", group: badGroup.id }],
//     executedBy: [{ type: "Group", group: secondBadGroup.id }],
//     media: [],
//     impact: { type: "CO2Emitted", amount: 300, unit: "gt" },
//     project: firstBadProject.id,
//     createdAt: subDays(now, 1),
//     updatedAt: subDays(now, 1),
//   },
//   {
//     id: uuid() as any,
//     title: "",
//     type: "Arrest",
//     who: {
//       type: "Actor",
//       actor: badActor.id,
//     },
//     for: [{ type: "Project", project: firstBadProject }],
//     date: subDays(now, 7),
//     createdAt: subDays(now, 1),
//     updatedAt: subDays(now, 1),
//   },
// ];

export const secondEventMetadata: Events.Event[] = [
  // {
  //   id: uuid() as any,
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
    id: uuid() as any,
    type: Events.Death.DEATH.value,
    draft: false,
    excerpt: {},
    payload: {
      location: undefined,
      victim: goodActor.id as any,
    },
    body: {},
    media: [],
    keywords: [],
    links: [],
    date: subDays(now, 10),
    createdAt: subDays(now, 2),
    updatedAt: subDays(now, 2),
    deletedAt: undefined,
  },
];

export const thirdEventMetadata: Events.Event[] = [
  // {
  //   title: "",
  //   id: uuid() as any,
  //   type: "ProjectTransaction",
  //   transaction: secondFund.id,
  //   project: firstGoodProject.id,
  //   date: subDays(now, 10),
  //   createdAt: subDays(now, 1),
  //   updatedAt: subDays(now, 1),
  // },
  // {
  //   title: "",
  //   id: uuid() as any,
  //   type: "ProjectTransaction",
  //   transaction: firstFund.id,
  //   project: firstBadProject.id,
  //   date: subDays(now, 10),
  //   createdAt: subDays(now, 1),
  //   updatedAt: subDays(now, 1),
  // },
  // {
  //   title: "",
  //   id: uuid() as any,
  //   type: "ProjectTransaction",
  //   transaction: thirdFund.id,
  //   project: firstBadProject.id,
  //   date: subDays(now, 10),
  //   createdAt: subDays(now, 1),
  //   updatedAt: subDays(now, 1),
  // },
  // {
  //   id: uuid() as any,
  //   type: "Protest",
  //   title: "Second protest form bad project",
  //   organizers: [
  //     {
  //       type: "Actor",
  //       actor: goodActor.id,
  //     },
  //   ],
  //   for: { type: "Project", project: firstBadProject },
  //   media: O.none,
  //   date: subDays(now, 8),
  //   createdAt: subDays(now, 1),
  //   updatedAt: subDays(now, 1),
  // },
];

export const fourthEventMetadata: Events.Event[] = [
  // {
  //   id: uuid() as any,
  //   type: "Protest",
  //   title: "Protest for good project",
  //   organizers: [{ type: "Group", group: goodGroup.id }],
  //   for: { type: "Project", project: firstGoodProject },
  //   media: O.some([
  //     {
  //       author: "Unknown",
  //       description: "Protest image",
  //       location: thirdImage.location,
  //     },
  //   ]),
  //   date: subDays(now, 5),
  //   createdAt: subDays(now, 1),
  //   updatedAt: subDays(now, 1),
  // },
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
  Condemned: [],
  Uncategorized: [],
};
