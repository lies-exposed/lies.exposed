import * as t from "io-ts";
import { Endpoint } from "ts-endpoint";
import { ListOutput, Output } from "../io/http/Common/Output.js";
import * as Setting from "../io/http/Setting.js";
import { ResourceEndpoints } from "./types.js";

const SingleSettingOutput = Output(Setting.Setting, "Setting");

export const List = Endpoint({
  Method: "GET",
  getPath: () => `/settings`,
  Input: {
    Query: Setting.GetSettingListQuery,
  },
  Output: ListOutput(Setting.Setting, "Settings"),
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/settings",
  Input: {
    Body: Setting.CreateSetting,
  },
  Output: SingleSettingOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/settings/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
  },
  Output: SingleSettingOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/settings/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
    Body: Setting.Setting,
  },
  Output: SingleSettingOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/settings/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
  },
  Output: SingleSettingOutput,
});

const settings = ResourceEndpoints({
  Get,
  Create,
  List,
  Edit,
  Delete,
  Custom: {},
});

export { settings };
