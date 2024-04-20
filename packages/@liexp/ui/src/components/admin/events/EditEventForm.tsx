import * as React from "react";
import { useDataProvider } from "../../../hooks/useDataProvider.js";
import BlockNoteInput from '../BlockNoteInput.js';
import { SocialPostFormTabContent } from "../SocialPost/SocialPostFormTabContent.js";
import { EditForm } from "../common/EditForm.js";
import { ImportMediaButton } from "../media/button/ImportMediaButton.js";
import EventPreview from "../previews/EventPreview.js";
import { FormTab, TabbedForm, type EditProps } from "../react-admin.js";
import {
  EventGeneralTab,
  type EventGeneralTabProps,
} from "../tabs/EventGeneralTab.js";
import { LazyFormTabContent } from "../tabs/LazyFormTabContent.js";
import { ReferenceLinkTab } from "../tabs/ReferenceLinkTab.js";
import { ReferenceMediaTab } from "../tabs/ReferenceMediaTab.js";
import { transformEvent } from "../transform.utils.js";
import { EventEditActions } from "./EditEventActions.js";
import { EventsFlowGraphFormTab } from "./tabs/EventsFlowGraphFormTab.js";
import { EventsNetworkGraphFormTab } from "./tabs/EventsNetworkGraphFormTab.js";
import { EventTitle } from "./titles/EventTitle.js";

interface EditEventFormProps extends EditProps {
  children: EventGeneralTabProps["children"];
}

export const EditEventForm: React.FC<EditEventFormProps> = ({
  children,
  title,
  ...props
}) => {
  const dataProvider = useDataProvider();
  return (
    <EditForm
      redirect={false}
      actions={<EventEditActions />}
      preview={<EventPreview />}
      title={<EventTitle />}
      transform={(r) => transformEvent(dataProvider)(r.id, r)}
      {...props}
    >
      <TabbedForm>
        <FormTab label="Generals">
          <EventGeneralTab>
            {(props, handlers) => children(props, handlers)}
          </EventGeneralTab>
        </FormTab>
        <FormTab label="body">
          <BlockNoteInput label="body" source="body" />
        </FormTab>

        <FormTab label="Media">
          <ImportMediaButton />
          <ReferenceMediaTab source="media" />
        </FormTab>
        <FormTab label="Links">
          <ReferenceLinkTab source="links" />
        </FormTab>
        <FormTab label="SocialPosts">
          <SocialPostFormTabContent type="events" source="id" />
        </FormTab>
        <FormTab label="Flow">
          <LazyFormTabContent tab={5}>
            <EventsFlowGraphFormTab type="events" />
          </LazyFormTabContent>
        </FormTab>
        <FormTab label="Network">
          <LazyFormTabContent tab={6}>
            <EventsNetworkGraphFormTab type="events" />
          </LazyFormTabContent>
        </FormTab>
      </TabbedForm>
    </EditForm>
  );
};
