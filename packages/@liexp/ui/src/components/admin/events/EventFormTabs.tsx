import React from "react";
import BlockNoteInput from "../BlockNoteInput.js";
import { SocialPostFormTabContent } from "../SocialPost/SocialPostFormTabContent.js";
import { ImportMediaButton } from "../media/button/ImportMediaButton.js";
import { TabbedForm } from "../react-admin.js";
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
      <TabbedForm.Tab label="Generals">
        <EventGeneralTab>
          {(props, handlers) => children(props, handlers)}
        </EventGeneralTab>
      </TabbedForm.Tab>
      <TabbedForm.Tab label="body">
        <BlockNoteInput label="body" source="body" />
      </TabbedForm.Tab>

      <TabbedForm.Tab label="Media">
        <ImportMediaButton />
        <ReferenceMediaTab source="media" />
      </TabbedForm.Tab>
      <TabbedForm.Tab label="Links">
        <ReferenceLinkTab source="links" />
      </TabbedForm.Tab>
      <TabbedForm.Tab label="SocialPosts">
        <SocialPostFormTabContent type="events" source="id" />
      </TabbedForm.Tab>
      <TabbedForm.Tab label="Flow">
        <LazyFormTabContent tab={5}>
          <EventsFlowGraphFormTab type="events" />
        </LazyFormTabContent>
      </TabbedForm.Tab>
      <TabbedForm.Tab label="Network">
        <LazyFormTabContent tab={6}>
          <EventsNetworkGraphFormTab type="events" />
        </LazyFormTabContent>
      </TabbedForm.Tab>
    </TabbedForm>
  );
};
