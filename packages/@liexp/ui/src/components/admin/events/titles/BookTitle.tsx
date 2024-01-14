import { getTitle } from "@liexp/shared/lib/helpers/event/index.js";
import type * as Events from "@liexp/shared/lib/io/http/Events/index.js";
import * as React from "react";
import { useRecordContext, type FieldProps } from "../../react-admin.js";

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
