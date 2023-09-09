import { apiProvider, authProvider } from "@liexp/ui/lib/client/api";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer";
import {
  SocialPostButton,
  type SocialPostButtonProps,
} from "@liexp/ui/lib/components/admin/common/SocialPostButton";
import { EventSocialPostButton } from "@liexp/ui/lib/components/admin/events/button/EventSocialPostButton";
import { useEventsQuery } from "@liexp/ui/lib/state/queries/event.queries";
import { type StoryFn, type Meta } from "@storybook/react";
import * as React from "react";
import { AdminContext, RecordContextProvider } from "react-admin";

const meta: Meta = {
  title: "Admin/Components/Buttons/SocialPostButton",
  component: SocialPostButton,
  argTypes: {},
};

export default meta;

const Template: StoryFn<SocialPostButtonProps> = (props) => {
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <QueriesRenderer
        queries={{
          events: useEventsQuery(
            { pagination: { perPage: 1, page: 1 } },
            false,
          ),
        }}
        render={({ events: { data: events } }) => {
          return (
            <AdminContext
              dataProvider={apiProvider}
              authProvider={authProvider}
            >
              <RecordContextProvider value={events[0]}>
                <EventSocialPostButton {...props} id={events[0].id} />
              </RecordContextProvider>
            </AdminContext>
          );
        }}
      />
    </div>
  );
};

export const EventSocialPostButtonExample = Template.bind({});
EventSocialPostButtonExample.args = {};
