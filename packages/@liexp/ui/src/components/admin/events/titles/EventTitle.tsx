import { EVENT_TYPES } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { type http } from "@liexp/shared/lib/io/index.js";
import * as React from "react";
import { type FieldProps, useRecordContext } from "../../react-admin.js";
import { BookTitle } from "./BookTitle.js";
import { DeathEventTitle } from "./DeathEventTitle.js";
import { DocumentaryReleaseTitle } from "./DocumentaryReleaseTitle.js";
import { PatentEventTitle } from "./PatentEventTitle.js";
import { QuoteTitle } from "./QuoteTitle.js";
import { ScientificStudyEventTitle } from "./ScientificStudyEventTitle.js";
import { TransactionTitle } from "./TransactionTitle.js";
import { UncategorizedEventTitle } from "./UncategorizedEventTitle.js";

interface EventTitleProps
  extends Omit<FieldProps<http.Events.Event>, "source"> {
  source?: string;
}

export const EventTitle: React.FC<EventTitleProps> = ({
  record: _record,
  source = "payload.title",
  ...props
}) => {
  const record = _record ?? useRecordContext<http.Events.Event>();
  if (record?.payload) {
    switch (record.type) {
      case EVENT_TYPES.UNCATEGORIZED:
        return <UncategorizedEventTitle {...{ ...props, source, record }} />;
      case EVENT_TYPES.SCIENTIFIC_STUDY:
        return <ScientificStudyEventTitle {...{ ...props, source, record }} />;
      case EVENT_TYPES.DEATH:
        return (
          <DeathEventTitle {...{ ...props, source: source as any, record }} />
        );
      case EVENT_TYPES.PATENT:
        return (
          <PatentEventTitle {...{ ...props, source: source as any, record }} />
        );
      case EVENT_TYPES.DOCUMENTARY:
        return (
          <DocumentaryReleaseTitle
            {...{ ...props, source: source as any, record }}
          />
        );
      case EVENT_TYPES.TRANSACTION:
        return <TransactionTitle {...props} record={record} />;
      case EVENT_TYPES.QUOTE:
        return <QuoteTitle {...{ ...props, source: source as any, record }} />;
      case EVENT_TYPES.BOOK:
        return <BookTitle {...{ ...props, source: source as any, record }} />;
    }
  }
  return <span>No record</span>;
};
