import type * as Events from "@liexp/io/lib/http/Events/index.js";
import { EventHelper } from "@liexp/shared/lib/helpers/event/event.helper.js";
import * as React from "react";
import { useRecordContext, type FieldProps } from "../../react-admin.js";

export const BookTitle: React.FC<FieldProps<Events.Book.Book>> = ({
  record: _record,
}) => {
  const record = useRecordContext({ record: _record });

  return (
    record && (
      <span>
        {EventHelper.getTitle(record, {
          groupsMembers: [],
          keywords: [],
          links: [],
          areas: [],
          media: [],
          groups: [],
          actors: [],
        })}
      </span>
    )
  );
};
