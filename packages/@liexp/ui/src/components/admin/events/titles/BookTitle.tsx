import { getTitle } from "@liexp/shared/lib/helpers/event";
import type * as Events from "@liexp/shared/lib/io/http/Events";
import * as React from "react";
import { useRecordContext, type FieldProps } from "../../react-admin";

export const BookTitle: React.FC<FieldProps<Events.Book.Book>> = ({
  record: _record,
}) => {
  const record = useRecordContext({ record: _record });

  return (
    <span>
      {getTitle(record, {
        groupsMembers: [],
        keywords: [],
        links: [],
        areas: [],
        media: [],
        groups: [],
        actors: [],
      })}
    </span>
  );
};
