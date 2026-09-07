import { ACTORS, GROUPS, KEYWORDS } from "@liexp/shared/lib/domain/literals/index.js";
import { formatDate, subWeeks } from "@liexp/shared/lib/utils/date.utils.js";
import type { Meta, StoryObj } from "@storybook/react";
import EventsNetworkGraphBox from "./EventsNetworkGraphBox.js";

const meta: Meta<typeof EventsNetworkGraphBox> = {
  title: "Containers/Graphs/EventsNetworkGraphBox",
  component: EventsNetworkGraphBox,
};

export default meta;

type Story = StoryObj<typeof EventsNetworkGraphBox>;

const Template: Story = (args) => <EventsNetworkGraphBox {...args} />;

const commonQuery = {
  startDate: formatDate(subWeeks(new Date(), 300)),
  endDate: formatDate(new Date()),
};

EventsByActors.args = {
  count: 20,
  type: ACTORS.literals[0],
  relations: [ACTORS.literals[0], KEYWORDS.literals[0]],
  query: {
    ...commonQuery,
    ids: ["4163db78-67ca-4243-80fe-05ff920e70e1"],
  },
  // selectedActorIds: ["1bde0d49-03a1-411d-9f18-2e70a722532b"],
};

const EventsByKeywords = Template.bind({});

EventsByKeywords.args = {
  count: 10,
  type: KEYWORDS.literals[0],
  relations: [GROUPS.literals[0]],
  query: {
    ...commonQuery,
    ids: ["fe502631-ef4e-4dfc-a1ff-c2cd04f3ff6d"],
  },
};

const EventsByGroups = Template.bind({});

EventsByGroups.args = {
  count: 10,
  type: GROUPS.literals[0],
  relations: [GROUPS.literals[0]],
  query: {
    ...commonQuery,
    ids: ["3879feae-a4f8-4f12-ad8d-3f199050afcd"],
  },
};

const EventsTimelineNetwork = Template.bind({});
EventsTimelineNetwork.args = {
  type: "events",
  relations: [GROUPS.literals[0]],
  query: {
    startDate: subWeeks(new Date(), 5).toISOString(),
    endDate: new Date().toISOString(),
  },
};

const OneEventNetwork = Template.bind({});
OneEventNetwork.args = {
  type: "events",
  relations: [GROUPS.literals[0]],
  query: {
    ...commonQuery,
    ids: ["c82575ea-120e-467b-8d75-cbf7e49d721a"],
  },
};

export {
  EventsByActors,
  EventsByKeywords,
  EventsByGroups,
  EventsTimelineNetwork,
  OneEventNetwork,
};
