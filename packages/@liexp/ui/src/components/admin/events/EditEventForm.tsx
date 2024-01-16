import { useDataProvider } from "ra-core";
import * as React from "react";
import ReactPageInput from "../ReactPageInput.js";
import { SocialPostFormTabContent } from "../SocialPost/SocialPostFormTabContent.js";
import { EditForm } from "../common/EditForm.js";
import { ImportMediaButton } from "../media/button/ImportMediaButton.js";
import EventPreview from "../previews/EventPreview.js";
import { type EditProps, FormTab, TabbedForm } from "../react-admin.js";
import { EventGeneralTab } from "../tabs/EventGeneralTab.js";
import { LazyFormTabContent } from "../tabs/LazyFormTabContent.js";
import { ReferenceLinkTab } from "../tabs/ReferenceLinkTab.js";
import { ReferenceMediaTab } from "../tabs/ReferenceMediaTab.js";
import { transformEvent } from "../transform.utils.js";
import { EventEditActions } from "./EditEventActions.js";
import { EventsFlowGraphFormTab } from "./tabs/EventsFlowGraphFormTab.js";
import { EventsNetworkGraphFormTab } from "./tabs/EventsNetworkGraphFormTab.js";
import { EventTitle } from "./titles/EventTitle.js";

export const EditEventForm: React.FC<React.PropsWithChildren<EditProps>> = ({
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
          <EventGeneralTab>{children}</EventGeneralTab>
        </FormTab>
        <FormTab label="body">
          <ReactPageInput label="body" source="body" />
        </FormTab>

        <FormTab label="Media">
          <ImportMediaButton />
          <ReferenceMediaTab source="media" fullWidth />
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
