import * as React from "react";
import { useDataProvider } from "../../../hooks/useDataProvider.js";
import { EditForm } from "../common/EditForm.js";
import EventPreview from "../previews/EventPreview.js";
import { type EditProps } from "../react-admin.js";
import { type EventGeneralTabProps } from "../tabs/EventGeneralTab.js";
import { transformEvent } from "../transform.utils.js";
import { EventEditActions } from "./EditEventActions.js";
import { EventFormTabs } from "./EventFormTabs.js";
import { EventTitle } from "./titles/EventTitle.js";

interface EditEventFormProps extends Omit<EditProps, "children"> {
  children: EventGeneralTabProps["children"];
}

export const EditEventForm: React.FC<EditEventFormProps> = ({
  children,
  title: _title,
  ...props
}) => {
  const dataProvider = useDataProvider();
  return (
    <EditForm
      redirect={false}
      actions={<EventEditActions />}
      preview={<EventPreview />}
      title={<EventTitle source="payload.title" />}
      transform={(r) => transformEvent(dataProvider)(r.id, r)}
      {...props}
    >
      <EventFormTabs>{children}</EventFormTabs>
    </EditForm>
  );
};
