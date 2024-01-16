import { getTitle } from "@liexp/shared/lib/helpers/event/index.js";
import type * as Events from "@liexp/shared/lib/io/http/Events/index.js";
import * as React from "react";
import {
  type FieldProps,
  useGetOne,
  useRecordContext,
} from "../../react-admin.js";

export const QuoteTitle: React.FC<FieldProps<Events.Quote.Quote>> = ({
  record: _record,
}) => {
  const record = useRecordContext({ record: _record });

  const { data: group } =
    record.payload.subject?.type === "Group"
      ? useGetOne("groups", { id: record.payload.subject.id })
      : { data: undefined };
  const { data: actor } =
    record.payload.subject?.type === "Actor"
      ? useGetOne("actors", { id: record.payload.subject.id })
      : { data: undefined };
  const groups = group ? [group] : [];
  const actors = actor ? [actor] : [];

  return (
    <span>
      {getTitle(record, {
        groupsMembers: [],
        keywords: [],
        links: [],
        areas: [],
        media: [],
        groups,
        actors,
      })}
    </span>
  );
};
