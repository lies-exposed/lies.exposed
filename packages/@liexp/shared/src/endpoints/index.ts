import { GetEndpointSubscriber } from "ts-endpoint-express";
import { IOError } from "ts-io-error/lib";
import * as Actor from "./actor.endpoints";
import * as Area from "./area.endpoints";
import * as Article from "./article.endpoints";
import * as Event from "./event.endpoints";
import * as DeathEvent from "./events/death.endpoint";
import * as DocumentaryEvent from './events/documentary.endpoints';
import * as PatentEvent from "./events/patent.endpoint";
import * as Graph from "./graph.endpoints";
import * as Group from "./group.endpoints";
import * as GroupMember from "./GroupMember.endpoints";
import * as Keyword from "./keyword.endpoints";
import * as Link from "./link.endpoints";
import * as Media from "./media.endpoints";
import * as OpenGraph from "./OpenGraph.endpoints";
import * as Page from "./page.endpoints";
import * as Project from "./project.endpoints";
import * as ProjectImage from "./ProjectImage.endpoints";
import * as ScientificStudy from "./scientificStudy.endpoint";
import * as Uploads from "./upload.endpoints";
import * as User from "./User.endpoints";

const Endpoints = {
  Actor: Actor.actors,
  Area: Area.areas,
  Article: Article.articles,
  Graph: Graph.graphs,
  Group: Group.groups,
  GroupMember: GroupMember.groupsMembers,
  Media: Media.media,
  Keyword: Keyword.keywords,
  Link: Link.links,
  // events
  Event: Event.events,
  DeathEvent: DeathEvent.deaths,
  PatentEvent: PatentEvent.patents,
  ScientificStudy: ScientificStudy.scientificStudies,
  DocumentaryEvent: DocumentaryEvent.documentaries,
  OpenGraph: OpenGraph.openGraphs,
  Page: Page.pages,
  Project: Project.projects,
  ProjectImage: ProjectImage.projectImages,
  // Uploads: Uploads.uploads,
  User: User.users,
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
