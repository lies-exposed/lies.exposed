import { ACTORS } from "@liexp/shared/lib/io/http/Actor.js";
import { GROUPS } from "@liexp/shared/lib/io/http/Group.js";
import { KEYWORDS } from "@liexp/shared/lib/io/http/Keyword.js";
import { formatDate } from "@liexp/shared/lib/utils/date.utils.js";
import { AutocompleteActorInput } from "@liexp/ui/lib/components/Input/AutocompleteActorInput.js";
import { AutocompleteGroupInput } from "@liexp/ui/lib/components/Input/AutocompleteGroupInput.js";
import { AutocompleteKeywordInput } from "@liexp/ui/lib/components/Input/AutocompleteKeywordInput.js";
import { Box } from "@liexp/ui/lib/components/mui/index.js";
import {
  EventsNetworkGraphBox,
  type EventNetworkGraphBoxProps,
} from "@liexp/ui/lib/containers/graphs/EventsNetworkGraphBox/EventsNetworkGraphBox.js";
import { type Meta, type StoryFn } from "@storybook/react";
import { subWeeks } from "date-fns";
import * as React from "react";

const meta: Meta = {
  title: "Containers/Graphs/EventNetworkGraphBox",
  component: EventsNetworkGraphBox,
  argTypes: {
    groupBy: {
      control: {
        type: "select",
        labels: ["actor", "group", "keyword"],
      },
    },
  },
};

export default meta;

const Template: StoryFn<EventNetworkGraphBoxProps> = ({
  query: { ids, ...query },
  ...props
}) => {
  const [items, setItem] = React.useState<any[]>(
    ids ? ids.map((id: string) => ({ id })) : [],
  );

  const inputProps = {
    style: { width: "100%" },
    selectedItems: items,
    onChange: (items: any[]) => {
      setItem(items);
    },
  };
  const input =
    props.type === KEYWORDS.Type ? (
      <AutocompleteKeywordInput {...inputProps} />
    ) : props.type === ACTORS.Type ? (
      <AutocompleteActorInput {...inputProps} />
    ) : props.type === GROUPS.Type ? (
      <AutocompleteGroupInput {...inputProps} />
    ) : (
      <div />
    );

  return (
    <>
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
        <Box style={{ display: "flex", height: 800 }}>
          <EventsNetworkGraphBox
            {...props}
            query={{
              ...query,
              ids,
            }}
          />
        </Box>
      </Box>
    </>
  );
};

const EventsByActors = Template.bind({});

const commonQuery = {
  startDate: formatDate(subWeeks(new Date(), 300)),
  endDate: formatDate(new Date()),
};

EventsByActors.args = {
  count: 20,
  type: ACTORS.Type,
  relations: [ACTORS.Type, KEYWORDS.Type],
  query: {
    ...commonQuery,
    ids: ["4163db78-67ca-4243-80fe-05ff920e70e1"],
  },
  // selectedActorIds: ["1bde0d49-03a1-411d-9f18-2e70a722532b"],
};

const EventsByKeywords = Template.bind({});

EventsByKeywords.args = {
  count: 10,
  type: KEYWORDS.Type,
  relations: [GROUPS.Type],
  query: {
    ...commonQuery,
    ids: ["fe502631-ef4e-4dfc-a1ff-c2cd04f3ff6d"],
  },
};

const EventsByGroups = Template.bind({});

EventsByGroups.args = {
  count: 10,
  type: GROUPS.Type,
  relations: [GROUPS.Type],
  query: {
    ...commonQuery,
    ids: ["3879feae-a4f8-4f12-ad8d-3f199050afcd"],
  },
};

const EventsTimelineNetwork = Template.bind({});
EventsTimelineNetwork.args = {
  type: "events",
  relations: [GROUPS.Type],
  query: {
    startDate: subWeeks(new Date(), 5).toISOString(),
    endDate: new Date().toISOString(),
  },
};

const OneEventNetwork = Template.bind({});
OneEventNetwork.args = {
  type: "events",
  relations: [GROUPS.Type],
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
