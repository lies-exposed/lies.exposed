import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import {
  SocialPostButton,
  type SocialPostButtonProps,
} from "@liexp/ui/lib/components/admin/common/SocialPostButton.js";
import { EventSocialPostButton } from "@liexp/ui/lib/components/admin/events/button/EventSocialPostButton.js";
import { useDataProvider } from "@liexp/ui/lib/hooks/useDataProvider.js";
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
  const apiProvider = useDataProvider();
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <QueriesRenderer
        queries={(Q) => ({
          events: Q.Event.list.useQuery(
            { filter: null, pagination: { perPage: 1, page: 1 } },
            undefined,
            false,
          ),
        })}
        render={({ events: { data: events } }) => {
          return (
            <AdminContext
              dataProvider={apiProvider}
              authProvider={{ logout: () => Promise.resolve() } as any}
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
