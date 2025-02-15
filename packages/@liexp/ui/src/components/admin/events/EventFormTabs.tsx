import React from "react";
import BlockNoteInput from "../BlockNoteInput.js";
import { SocialPostFormTabContent } from "../SocialPost/SocialPostFormTabContent.js";
import { ImportMediaButton } from "../media/button/ImportMediaButton.js";
import { FormTab, TabbedForm } from "../react-admin.js";
import {
  EventGeneralTab,
  type EventGeneralTabProps,
} from "../tabs/EventGeneralTab.js";
import { LazyFormTabContent } from "../tabs/LazyFormTabContent.js";
import { ReferenceLinkTab } from "../tabs/ReferenceLinkTab.js";
import { ReferenceMediaTab } from "../tabs/ReferenceMediaTab.js";
import { EventsFlowGraphFormTab } from "./tabs/EventsFlowGraphFormTab.js";
import { EventsNetworkGraphFormTab } from "./tabs/EventsNetworkGraphFormTab.js";

interface EventFormTabsProps {
  children: EventGeneralTabProps["children"];
}

export const EventFormTabs: React.FC<EventFormTabsProps> = ({ children }) => {
  return (
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
  );
};
