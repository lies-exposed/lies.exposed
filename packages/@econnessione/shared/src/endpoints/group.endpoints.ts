import * as t from "io-ts";
import { Endpoint } from "ts-endpoint";
import * as http from "../io/http";
import { nonEmptyRecordFromType } from "./NonEmptyRecord";
import { Output } from "./Output";

const SingleGroupOutput = Output(http.Group.GroupFrontmatter, "Group");
const ListGroupOutput = Output(
  t.array(http.Group.GroupFrontmatter),
  "ListGroup"
);

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/groups",
  Input: {
    Query: undefined,
  },
  Output: ListGroupOutput,
});

const CreateBody = t.strict({
  name: t.string,
  color: t.string,
  kind: http.Group.GroupKind,
  avatar: t.strict({
    src: t.string,
    path: t.string,
  }),
  body: t.string,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/groups",
  Input: {
    Query: undefined,
    Body: CreateBody,
  },
  Output: SingleGroupOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/groups/${id}`,
  Input: {
    Query: undefined,
    Params: { id: t.string },
  },
  Output: SingleGroupOutput,
});

const { ...editBodyProps } = CreateBody.type.props;
export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/groups/${id}`,
  Input: {
    Query: undefined,
    Params: { id: t.string },
    Body: nonEmptyRecordFromType({
      ...editBodyProps,
      avatar: t.union([
        t.string,
        t.type({
          src: t.string,
          path: t.string,
        }),
      ]),
    }),
  },
  Output: SingleGroupOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/groups/${id}`,
  Input: {
    Query: undefined,
    Params: { id: t.string },
  },
  Output: SingleGroupOutput,
});
