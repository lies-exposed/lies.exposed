import { EVENT_TYPES } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { type Event } from "@liexp/shared/lib/io/http/Events/index.js";
import { EditEventForm } from "@liexp/ui/lib/components/admin/events/EditEventForm.js";
import { BookEditFormTab } from "@liexp/ui/lib/components/admin/events/tabs/BookEditFormTab.js";
import { DeathEventEditFormTab } from "@liexp/ui/lib/components/admin/events/tabs/DeathEventEditFormTab.js";
import { DocumentaryEditFormTab } from "@liexp/ui/lib/components/admin/events/tabs/DocumentaryEditFormTab.js";
import { PatentEventEditFormTab } from "@liexp/ui/lib/components/admin/events/tabs/PatentEventEditTab.js";
import { QuoteEditFormTab } from "@liexp/ui/lib/components/admin/events/tabs/QuoteEditFormTab.js";
import { ScientificStudyEventEditTab } from "@liexp/ui/lib/components/admin/events/tabs/ScientificStudyEventEditTab.js";
import { UncategorizedEventEditTab } from "@liexp/ui/lib/components/admin/events/tabs/UncategorizedEventEditTab.js";
import { EventTitle } from "@liexp/ui/lib/components/admin/events/titles/EventTitle.js";
import { FormDataConsumer } from "@liexp/ui/lib/components/admin/react-admin.js";
import * as React from "react";

const EventEdit: React.FC = (props) => {
  return (
    <EditEventForm {...props} title={<EventTitle />} redirect={false}>
      {(suggestions, handlers) => (
        <FormDataConsumer<Event>>
          {({ formData, scopedFormData: _scopedFormData, ..._rest }) => {
            if (formData.type === EVENT_TYPES.DOCUMENTARY) {
              return <DocumentaryEditFormTab />;
            }
            if (formData.type === EVENT_TYPES.DEATH) {
              return <DeathEventEditFormTab />;
            }
            if (formData.type === EVENT_TYPES.SCIENTIFIC_STUDY) {
              return <ScientificStudyEventEditTab />;
            }
            if (formData.type === EVENT_TYPES.QUOTE) {
              return <QuoteEditFormTab />;
            }
            if (formData.type === EVENT_TYPES.PATENT) {
              return <PatentEventEditFormTab />;
            }

            if (formData.type === EVENT_TYPES.BOOK) {
              return <BookEditFormTab />;
            }

            return (
              <UncategorizedEventEditTab
                suggestions={suggestions}
                handlers={handlers}
                record={formData}
              />
            );
          }}
        </FormDataConsumer>
      )}
    </EditEventForm>
  );
};

export default EventEdit;
