import { GetEndpointSubscriber } from "ts-endpoint-express";
import { type IOError } from "ts-io-error/lib/index.js";
import * as GroupMember from "./GroupMember.endpoints.js";
import * as Networks from "./Network.endpoints.js";
import * as OpenGraph from "./OpenGraph.endpoints.js";
import * as ProjectImage from "./ProjectImage.endpoints.js";
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
import * as Page from "./page.endpoints.js";
import * as Project from "./project.endpoints.js";
import * as SocialPosts from "./socialPost.endpoints.js";
import * as Story from "./story.endpoints.js";
import * as Uploads from "./upload.endpoints.js";

const Endpoints = {
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
  OpenGraph: OpenGraph.openGraphs,
  Page: Page.pages,
  Project: Project.projects,
  ProjectImage: ProjectImage.projectImages,
  Stats: Stats.stats,
  Networks: Networks.networks,
  Healthcheck: Healthcheck.healthcheck,
  // Uploads: Uploads.uploads,
  SocialPosts: SocialPosts.socialPosts,
};

type Endpoints = typeof Endpoints;

const AddEndpoint = GetEndpointSubscriber((e): IOError => {
  return {
    name: "EndpointError",
    status: 500,
    message: "Unknown error",
    details: {
      kind: "DecodingError",
      errors: e,
    },
  };
});

export const UserLogin = User.UserLogin;
export const PageDeleteMany = Page.DeleteManyPage;
export { Endpoints, AddEndpoint, Uploads, Graph };
