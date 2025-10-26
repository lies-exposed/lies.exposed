import { type EndpointsMapType } from "@ts-endpoint/core";
import * as GroupMember from "./GroupMember.endpoints.js";
import * as Networks from "./Network.endpoints.js";
import * as OpenGraph from "./OpenGraph.endpoints.js";
import * as Stats from "./Stats.endpoints.js";
import * as User from "./User.endpoints.js";
import * as Actor from "./actor.endpoints.js";
import * as Admins from "./admin.endpoints.js";
import * as Area from "./area.endpoints.js";
import * as BookEvent from "./events/book.endpoints.js";
import * as DeathEvent from "./events/death.endpoints.js";
import * as DocumentaryEvent from "./events/documentary.endpoints.js";
import * as Event from "./events/event.endpoints.js";
import * as PatentEvent from "./events/patent.endpoints.js";
import * as QuoteEvent from "./events/quote.endpoints.js";
import * as ScientificStudy from "./events/scientificStudy.endpoint.js";
import * as TransactionEvent from "./events/transactions.endpoints.js";
import * as Graph from "./graph.endpoints.js";
import * as Group from "./group.endpoints.js";
import * as Healthcheck from "./healthcheck.endpoints.js";
import * as Keyword from "./keyword.endpoints.js";
import * as Link from "./link.endpoints.js";
import * as Media from "./media.endpoints.js";
import * as Nations from "./nation.endpoints.js";
import * as Page from "./page.endpoints.js";
import * as Project from "./project.endpoints.js";
import * as Queues from "./queue.endpoints.js";
import * as Setting from "./setting.endpoints.js";
import * as SocialPosts from "./socialPost.endpoints.js";
import * as Story from "./story.endpoints.js";
import * as Uploads from "./upload.endpoints.js";

interface Endpoints extends EndpointsMapType {
  Admin: typeof Admins.admin;
  User: typeof User.users;
  Actor: typeof Actor.actors;
  Area: typeof Area.areas;
  Group: typeof Group.groups;
  GroupMember: typeof GroupMember.groupsMembers;
  Media: typeof Media.media;
  Keyword: typeof Keyword.keywords;
  Link: typeof Link.links;
  Story: typeof Story.stories;
  Graph: typeof Graph.graphs;
  Event: typeof Event.events;
  BookEvent: typeof BookEvent.books;
  DeathEvent: typeof DeathEvent.deaths;
  PatentEvent: typeof PatentEvent.patents;
  ScientificStudy: typeof ScientificStudy.scientificStudies;
  DocumentaryEvent: typeof DocumentaryEvent.documentaries;
  Nation: typeof Nations.nations;
  QuoteEvent: typeof QuoteEvent.quotes;
  TransactionEvent: typeof TransactionEvent.transactions;
  OpenGraph: typeof OpenGraph.openGraphs;
  Page: typeof Page.pages;
  Project: typeof Project.projects;
  Queues: typeof Queues.queues;
  Stats: typeof Stats.stats;
  Networks: typeof Networks.networks;
  Healthcheck: typeof Healthcheck.healthcheck;
  SocialPosts: typeof SocialPosts.socialPosts;
  Setting: typeof Setting.settings;
}

const Endpoints: Endpoints = {
  // admin
  Admin: Admins.admin,
  // user
  User: User.users,
  // data resources
  Actor: Actor.actors,
  Area: Area.areas,
  Group: Group.groups,
  GroupMember: GroupMember.groupsMembers,
  Media: Media.media,
  Keyword: Keyword.keywords,
  Link: Link.links,

  // stories
  Story: Story.stories,

  // graphs
  Graph: Graph.graphs,

  // events
  Event: Event.events,
  BookEvent: BookEvent.books,
  DeathEvent: DeathEvent.deaths,
  PatentEvent: PatentEvent.patents,
  ScientificStudy: ScientificStudy.scientificStudies,
  DocumentaryEvent: DocumentaryEvent.documentaries,
  QuoteEvent: QuoteEvent.quotes,
  TransactionEvent: TransactionEvent.transactions,
  // other
  Nation: Nations.nations,
  OpenGraph: OpenGraph.openGraphs,
  Page: Page.pages,
  Project: Project.projects,
  // ProjectImage endpoints removed
  Stats: Stats.stats,
  Networks: Networks.networks,
  Healthcheck: Healthcheck.healthcheck,
  // Uploads: Uploads.uploads,
  SocialPosts: SocialPosts.socialPosts,
  Setting: Setting.settings,
  Queues: Queues.queues,
};

export { Endpoints, Uploads };
