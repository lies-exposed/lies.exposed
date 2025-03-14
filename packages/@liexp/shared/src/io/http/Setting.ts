import { Schema } from "effect";
import { BaseProps, JSONFromString } from "./Common/index.js";
import { GetListQuery } from "./Query/GetListQuery.js";
import { OptionFromNullishToNull } from './Common/OptionFromNullishToNull.js';

export const GetSettingListQuery = Schema.Struct({
  ...GetListQuery.fields,
  id: OptionFromNullishToNull(Schema.Array(Schema.String)),
}).annotations({
  title: "GetSettingListQuery",
});

export type GetSettingListQuery = typeof GetSettingListQuery.Type;

export const CreateSetting = Schema.Struct({
  id: Schema.String,
  value: JSONFromString,
}).annotations({
  title: "CreateSetting",
});
export type CreateSetting = typeof CreateSetting.Type;

const { id: _id, ...baseProps } = BaseProps.fields;
export const Setting = Schema.Struct({
  ...baseProps,
  ...CreateSetting.fields,
}).annotations({
  title: "Setting",
});

export type Setting = typeof Setting.Type;
