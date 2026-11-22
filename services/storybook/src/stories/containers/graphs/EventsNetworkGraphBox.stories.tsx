import { ACTORS, type Actor } from "@liexp/io/lib/http/Actor.js";
import { uuid, type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { GROUPS, type Group } from "@liexp/io/lib/http/Group.js";
import { KEYWORDS, type Keyword } from "@liexp/io/lib/http/Keyword.js";
import { formatDate } from "@liexp/shared/lib/utils/date.utils.js";
import { ActorArb } from "@liexp/test/lib/arbitrary/Actor.arbitrary.js";
import { GroupArb } from "@liexp/test/lib/arbitrary/Group.arbitrary.js";
import { KeywordArb } from "@liexp/test/lib/arbitrary/Keyword.arbitrary.js";
import { AutocompleteActorInput } from "@liexp/ui/lib/components/Input/AutocompleteActorInput.js";
import { AutocompleteGroupInput } from "@liexp/ui/lib/components/Input/AutocompleteGroupInput.js";
import { AutocompleteKeywordInput } from "@liexp/ui/lib/components/Input/AutocompleteKeywordInput.js";
import { Box } from "@liexp/ui/lib/components/mui/index.js";
import {
  EventsNetworkGraphBox,
  type EventNetworkGraphBoxProps,
} from "@liexp/ui/lib/containers/graphs/EventsNetworkGraphBox/EventsNetworkGraphBox.js";
import { type Meta, type StoryObj } from "@storybook/react-vite";
import { subWeeks } from "date-fns";
import fc from "fast-check";
import * as React from "react";

const sampleActors: readonly Actor[] = fc.sample(ActorArb, 1);
const sampleGroups: readonly Group[] = fc.sample(GroupArb, 1);
const sampleKeywords: readonly Keyword[] = fc.sample(KeywordArb, 1);

const actorId: UUID = sampleActors[0]!.id;
const groupId: UUID = sampleGroups[0]!.id;
const keywordId: UUID = sampleKeywords[0]!.id;

const idsWith = (ids: readonly UUID[]) => {
  const first = ids[0];
  if (first === undefined) {
    return null;
  }
  const nonEmptyIds: readonly [UUID, ...UUID[]] = [first, ...ids.slice(1)];
  return nonEmptyIds;
};

const GraphLayout = ({
  input,
  graph,
}: {
  input: React.ReactElement;
  graph: React.ReactElement;
}): React.ReactElement => {
  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box style={{ display: "flex", flexDirection: "column" }}>
        <Box style={{ display: "flex" }}>{input}</Box>
      </Box>
      <Box style={{ display: "flex", height: 800 }}>{graph}</Box>
    </Box>
  );
};

const KeywordNetwork = (
  props: EventNetworkGraphBoxProps,
): React.ReactElement => {
  const { query, ...rest } = props;
  const [items, setItems] = React.useState<readonly Keyword[]>(
    query.ids === null || query.ids === undefined ? [] : sampleKeywords,
  );

  return (
    <GraphLayout
      input={
        <AutocompleteKeywordInput
          selectedItems={[...items]}
          onChange={(next) => setItems(next)}
        />
      }
      graph={
        <EventsNetworkGraphBox
          {...rest}
          type={KEYWORDS.literals[0]}
          query={{ ...query, ids: idsWith(items.map((item) => item.id)) }}
        />
      }
    />
  );
};

const ActorNetwork = (props: EventNetworkGraphBoxProps): React.ReactElement => {
  const { query, ...rest } = props;
  const [items, setItems] = React.useState<readonly Actor[]>(
    query.ids === null || query.ids === undefined ? [] : sampleActors,
  );

  return (
    <GraphLayout
      input={
        <AutocompleteActorInput
          selectedItems={[...items]}
          onChange={(next) => setItems(next)}
        />
      }
      graph={
        <EventsNetworkGraphBox
          {...rest}
          type={ACTORS.literals[0]}
          query={{ ...query, ids: idsWith(items.map((item) => item.id)) }}
        />
      }
    />
  );
};

const GroupNetwork = (props: EventNetworkGraphBoxProps): React.ReactElement => {
  const { query, ...rest } = props;
  const [items, setItems] = React.useState<readonly Group[]>(
    query.ids === null || query.ids === undefined ? [] : sampleGroups,
  );

  return (
    <GraphLayout
      input={
        <AutocompleteGroupInput
          selectedItems={[...items]}
          onChange={(next) => setItems(next)}
        />
      }
      graph={
        <EventsNetworkGraphBox
          {...rest}
          type={GROUPS.literals[0]}
          query={{ ...query, ids: idsWith(items.map((item) => item.id)) }}
        />
      }
    />
  );
};

const NetworkWithInput = (
  props: EventNetworkGraphBoxProps,
): React.ReactElement => {
  if (props.type === KEYWORDS.literals[0]) {
    return KeywordNetwork(props);
  }
  if (props.type === ACTORS.literals[0]) {
    return ActorNetwork(props);
  }
  if (props.type === GROUPS.literals[0]) {
    return GroupNetwork(props);
  }
  return (
    <Box style={{ display: "flex", height: 800 }}>
      <EventsNetworkGraphBox {...props} />
    </Box>
  );
};

const meta = {
  title: "Containers/Graphs/EventNetworkGraphBox",
  component: EventsNetworkGraphBox,
  render: NetworkWithInput,
} satisfies Meta<EventNetworkGraphBoxProps>;

export default meta;

type Story = StoryObj<typeof meta>;

const commonQuery = {
  startDate: formatDate(subWeeks(new Date(), 300)),
  endDate: formatDate(new Date()),
};

const EventsByActors: Story = {
  args: {
    count: 20,
    type: ACTORS.literals[0],
    relations: [ACTORS.literals[0], KEYWORDS.literals[0]],
    query: {
      ...commonQuery,
      ids: [actorId],
    },
  },
};

const EventsByKeywords: Story = {
  args: {
    count: 10,
    type: KEYWORDS.literals[0],
    relations: [GROUPS.literals[0]],
    query: {
      ...commonQuery,
      ids: [keywordId],
    },
  },
};

const EventsByGroups: Story = {
  args: {
    count: 10,
    type: GROUPS.literals[0],
    relations: [GROUPS.literals[0]],
    query: {
      ...commonQuery,
      ids: [groupId],
    },
  },
};

const EventsTimelineNetwork: Story = {
  args: {
    type: "events",
    relations: [GROUPS.literals[0]],
    query: {
      startDate: subWeeks(new Date(), 5).toISOString(),
      endDate: new Date().toISOString(),
    },
  },
};

const OneEventNetwork: Story = {
  args: {
    type: "events",
    relations: [GROUPS.literals[0]],
    query: {
      ...commonQuery,
      ids: [uuid()],
    },
  },
};

export {
  EventsByActors,
  EventsByKeywords,
  EventsByGroups,
  EventsTimelineNetwork,
  OneEventNetwork,
};
