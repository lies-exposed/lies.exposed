import * as t from "io-ts";
import { BooleanFromString } from "io-ts-types/lib/BooleanFromString.js";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable.js";
import { BaseProps } from "./Common/BaseProps.js";
import { Geometry } from "./Common/Geometry/index.js";
import { UUID } from "./Common/UUID.js";
import { Media } from "./Media.js";
import { GetListQuery } from "./Query/GetListQuery.js";

export const AREAS = t.literal("areas");
export type AREAS = t.TypeOf<typeof AREAS>;

export const ListAreaQuery = t.type(
  {
    ...GetListQuery.props,
    ids: optionFromNullable(t.array(UUID)),
    draft: optionFromNullable(BooleanFromString),
  },
  "ListAreaQuery",
);

export type ListAreaQuery = t.TypeOf<typeof ListAreaQuery>;

export const CreateAreaBody = t.strict(
  {
    label: t.string,
    slug: t.string,
    draft: t.boolean,
    geometry: Geometry,
    body: t.UnknownRecord,
  },
  "CreateAreaBody",
);

export const EditAreaBody = t.strict(
  {
    geometry: optionFromNullable(Geometry),
    label: optionFromNullable(t.string),
    slug: optionFromNullable(t.string),
    draft: optionFromNullable(t.boolean),
    body: optionFromNullable(t.UnknownRecord),
    featuredImage: optionFromNullable(UUID),
    media: t.array(UUID),
    events: optionFromNullable(t.array(UUID)),
    updateGeometry: optionFromNullable(t.boolean),
  },
  "EditAreaBody",
);

export const Area = t.strict(
  {
    ...BaseProps.type.props,
    ...CreateAreaBody.type.props,
    body: t.union([t.UnknownRecord, t.null]),
    featuredImage: t.union([Media, t.null]),
    media: t.array(UUID),
    events: t.array(UUID),
    socialPosts: t.array(UUID),
  },
  "Area",
);

export type Area = t.TypeOf<typeof Area>;
