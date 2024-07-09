import * as t from "io-ts";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable.js";
import { BaseProps, JSONFromString } from "./Common/index.js";
import { GetListQuery } from "./Query/GetListQuery.js";

export const GetSettingListQuery = t.type(
  {
    ...GetListQuery.props,
    id: optionFromNullable(t.array(t.string)),
  },
  "GetSettingListQuery",
);

export type GetSettingListQuery = t.TypeOf<typeof GetSettingListQuery>;

export const CreateSetting = t.strict(
  {
    id: t.string,
    value: JSONFromString,
  },
  "CreateSetting",
);
export type CreateSetting = t.TypeOf<typeof CreateSetting>;

const { id: _id, ...baseProps } = BaseProps.type.props;
export const Setting = t.strict(
  {
    ...baseProps,
    ...CreateSetting.type.props,
  },
  "Setting",
);

export type Setting = t.TypeOf<typeof Setting>;
