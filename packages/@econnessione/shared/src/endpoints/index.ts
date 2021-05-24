import { GetEndpointSubscriber } from "ts-endpoint-express";
import { IOError } from "ts-io-error/lib";
import * as GroupMember from "./GroupMember.endpoints";
import * as ProjectImage from "./ProjectImage.endpoints";
import * as User from "./User.endpoints";
import * as Actor from "./actor.endpoints";
import * as Area from "./area.endpoints";
import * as Article from "./article.endpoints";
import * as Event from "./event.endpoints";
import * as Graph from "./graph.endpoints";
import * as Group from "./group.endpoints";
import * as Page from "./page.endpoints";
import * as Project from "./project.endpoints";
import * as Uploads from "./upload.endpoints";

const endpoints = {
  Actor,
  Area,
  Article,
  Event,
  Graph,
  Group,
  GroupMember,
  Page,
  Project,
  ProjectImage,
  Uploads,
  User,
};

const AddEndpoint = GetEndpointSubscriber((): IOError => {
  return {
    name: "EndpointError",
    status: 500,
    message: "Unknown error",
    details: {
      kind: "DecodingError",
      errors: [],
    },
  };
});

export { endpoints, AddEndpoint };
