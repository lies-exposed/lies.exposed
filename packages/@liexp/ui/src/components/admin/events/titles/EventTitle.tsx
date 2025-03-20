import { http } from "@liexp/shared/lib/io/index.js";
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
      case http.Events.EventTypes.UNCATEGORIZED.Type:
        return <UncategorizedEventTitle {...{ ...props, source, record }} />;
      case http.Events.EventTypes.SCIENTIFIC_STUDY.Type:
        return <ScientificStudyEventTitle {...{ ...props, source, record }} />;
      case http.Events.EventTypes.DEATH.Type:
        return (
          <DeathEventTitle {...{ ...props, source: source as any, record }} />
        );
      case http.Events.EventTypes.PATENT.Type:
        return (
          <PatentEventTitle {...{ ...props, source: source as any, record }} />
        );
      case http.Events.EventTypes.DOCUMENTARY.Type:
        return (
          <DocumentaryReleaseTitle
            {...{ ...props, source: source as any, record }}
          />
        );
      case http.Events.EventTypes.TRANSACTION.Type:
        return <TransactionTitle {...props} record={record} />;
      case http.Events.EventTypes.QUOTE.Type:
        return <QuoteTitle {...{ ...props, source: source as any, record }} />;
      case http.Events.EventTypes.BOOK.Type:
        return <BookTitle {...{ ...props, source: source as any, record }} />;
    }
  }
  return <span>No record</span>;
};
