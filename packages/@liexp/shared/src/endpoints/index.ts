import { GetEndpointSubscriber } from "ts-endpoint-express";
import { type IOError } from "ts-io-error/lib";
import * as GroupMember from "./GroupMember.endpoints";
import * as Networks from "./Network.endpoints";
import * as OpenGraph from "./OpenGraph.endpoints";
import * as ProjectImage from "./ProjectImage.endpoints";
import * as Stats from "./Stats.endpoints";
import * as User from "./User.endpoints";
import * as Actor from "./actor.endpoints";
import * as Admins from "./admin.endpoints";
import * as Area from "./area.endpoints";
import * as BookEvent from "./events/book.endpoints";
import * as DeathEvent from "./events/death.endpoints";
import * as DocumentaryEvent from "./events/documentary.endpoints";
import * as Event from "./events/event.endpoints";
import * as PatentEvent from "./events/patent.endpoints";
import * as QuoteEvent from "./events/quote.endpoints";
import * as ScientificStudy from "./events/scientificStudy.endpoint";
import * as TransactionEvent from "./events/transactions.endpoints";
import * as Graph from "./graph.endpoints";
import * as Group from "./group.endpoints";
import * as Healthcheck from "./healthcheck.endpoints";
import * as Keyword from "./keyword.endpoints";
import * as Link from "./link.endpoints";
import * as Media from "./media.endpoints";
import * as Page from "./page.endpoints";
import * as Project from "./project.endpoints";
import * as SocialPosts from "./socialPost.endpoints";
import * as Story from "./story.endpoints";
import * as Uploads from "./upload.endpoints";

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
