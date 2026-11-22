import { ACTORS } from "@liexp/io/lib/http/Actor.js";
import { type Actor } from "@liexp/io/lib/http/Actor.js";
import { uuid, type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { GROUPS, type Group } from "@liexp/io/lib/http/Group.js";
import { KEYWORDS, type Keyword } from "@liexp/io/lib/http/Keyword.js";
import { ActorArb } from "@liexp/test/lib/arbitrary/Actor.arbitrary.js";
import { GroupArb } from "@liexp/test/lib/arbitrary/Group.arbitrary.js";
import { KeywordArb } from "@liexp/test/lib/arbitrary/Keyword.arbitrary.js";
import { AutocompleteActorInput } from "@liexp/ui/lib/components/Input/AutocompleteActorInput.js";
import { AutocompleteGroupInput } from "@liexp/ui/lib/components/Input/AutocompleteGroupInput.js";
import { AutocompleteKeywordInput } from "@liexp/ui/lib/components/Input/AutocompleteKeywordInput.js";
import { Box } from "@liexp/ui/lib/components/mui/index.js";
import {
  EventsFlowGraphBox,
  type EventsFlowGraphBoxProps,
} from "@liexp/ui/lib/containers/graphs/EventsFlowGraphBox.js";
import { type Meta, type StoryObj } from "@storybook/react-vite";
import { subYears } from "date-fns";
import fc from "fast-check";
import * as React from "react";

interface FlowGraphStoryProps {
  id: UUID;
  type: EventsFlowGraphBoxProps["type"];
}

const sample = {
  [ACTORS.literals[0]]: fc.sample(ActorArb, 1)[0],
  [GROUPS.literals[0]]: fc.sample(GroupArb, 1)[0],
  [KEYWORDS.literals[0]]: fc.sample(KeywordArb, 1)[0],
};

const query = (type: FlowGraphStoryProps["type"], id: UUID) => ({
  [type]: [id],
  startDate: subYears(new Date(), 5).toISOString(),
  endDate: new Date().toISOString(),
});

const FlowGraphWithInput = (props: FlowGraphStoryProps): React.ReactElement => {
  const { type } = props;

  if (type === ACTORS.literals[0]) {
    return <ActorFlowGraph {...props} />;
  }
  if (type === GROUPS.literals[0]) {
    return <GroupFlowGraph {...props} />;
  }
  return <KeywordFlowGraph {...props} />;

  function ActorFlowGraph({
    type,
    id,
  }: FlowGraphStoryProps): React.ReactElement {
    const [item, setItem] = React.useState<Actor | undefined>(
      id ? sample[ACTORS.literals[0]] : undefined,
    );
    return (
      <Box style={{ height: "100%", width: "100%", position: "absolute" }}>
        <AutocompleteActorInput
          selectedItems={item ? [item] : []}
          discrete={false}
          onChange={(items) => setItem(items[0])}
        />
        {item ? (
          <EventsFlowGraphBox
            type={type}
            id={item.id}
            query={query(type, item.id)}
            onEventClick={() => {
              // eslint-disable-next-line no-console
              console.log("Event clicked");
            }}
          />
        ) : null}
      </Box>
    );
  }

  function GroupFlowGraph({
    type,
    id,
  }: FlowGraphStoryProps): React.ReactElement {
    const [item, setItem] = React.useState<Group | undefined>(
      id ? sample[GROUPS.literals[0]] : undefined,
    );
    return (
      <Box style={{ height: "100%", width: "100%", position: "absolute" }}>
        <AutocompleteGroupInput
          selectedItems={item ? [item] : []}
          discrete={false}
          onChange={(items) => setItem(items[0])}
        />
        {item ? (
          <EventsFlowGraphBox
            type={type}
            id={item.id}
            query={query(type, item.id)}
            onEventClick={() => {
              // eslint-disable-next-line no-console
              console.log("Event clicked");
            }}
          />
        ) : null}
      </Box>
    );
  }

  function KeywordFlowGraph({
    type,
    id,
  }: FlowGraphStoryProps): React.ReactElement {
    const [item, setItem] = React.useState<Keyword | undefined>(
      id ? sample[KEYWORDS.literals[0]] : undefined,
    );
    return (
      <Box style={{ height: "100%", width: "100%", position: "absolute" }}>
        <AutocompleteKeywordInput
          selectedItems={item ? [item] : []}
          discrete={false}
          onChange={(items) => setItem(items[0])}
        />
        {item ? (
          <EventsFlowGraphBox
            type={type}
            id={item.id}
            query={query(type, item.id)}
            onEventClick={() => {
              // eslint-disable-next-line no-console
              console.log("Event clicked");
            }}
          />
        ) : null}
      </Box>
    );
  }
};

const meta = {
  title: "Containers/Graphs/EventsFlowGraphBox",
  component: FlowGraphWithInput,
} satisfies Meta<FlowGraphStoryProps>;

export default meta;

type Story = StoryObj<typeof meta>;

const ActorEventsFlowGraphExample: Story = {
  render: FlowGraphWithInput,
  args: {
    type: "actors",
    id: uuid(),
  },
};

const GroupEventsFlowGraphExample: Story = {
  render: FlowGraphWithInput,
  args: {
    type: "groups",
    id: uuid(),
  },
};

const KeywordEventsFlowGraphExample: Story = {
  render: FlowGraphWithInput,
  args: {
    type: "keywords",
    id: sample[KEYWORDS.literals[0]].id,
  },
};

export {
  ActorEventsFlowGraphExample,
  GroupEventsFlowGraphExample,
  KeywordEventsFlowGraphExample,
};
