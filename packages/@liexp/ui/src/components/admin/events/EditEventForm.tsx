import { useDataProvider } from "ra-core";
import * as React from "react";
import ReactPageInput from "../ReactPageInput";
import { SocialPostFormTabContent } from "../SocialPost/SocialPostFormTabContent";
import { EditForm } from "../common/EditForm";
import { ImportMediaButton } from "../media/button/ImportMediaButton";
import EventPreview from "../previews/EventPreview";
import { type EditProps, FormTab, TabbedForm } from "../react-admin";
import { EventGeneralTab } from "../tabs/EventGeneralTab";
import { LazyFormTabContent } from "../tabs/LazyFormTabContent";
import { ReferenceLinkTab } from "../tabs/ReferenceLinkTab";
import { ReferenceMediaTab } from "../tabs/ReferenceMediaTab";
import { transformEvent } from "../transform.utils";
import { EventEditActions } from "./EditEventActions";
import { EventsFlowGraphFormTab } from "./tabs/EventsFlowGraphFormTab";
import { EventsNetworkGraphFormTab } from "./tabs/EventsNetworkGraphFormTab";
import { EventTitle } from "./titles/EventTitle";

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
