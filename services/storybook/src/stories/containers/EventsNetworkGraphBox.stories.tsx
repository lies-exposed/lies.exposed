import { ACTORS } from "@liexp/shared/io/http/Actor";
import { GROUPS } from "@liexp/shared/io/http/Group";
import { KEYWORDS } from "@liexp/shared/io/http/Keyword";
import { formatDate } from "@liexp/shared/utils/date";
import { AutocompleteActorInput } from "@liexp/ui/components/Input/AutocompleteActorInput";
import { AutocompleteGroupInput } from "@liexp/ui/components/Input/AutocompleteGroupInput";
import { AutocompleteKeywordInput } from "@liexp/ui/components/Input/AutocompleteKeywordInput";
import { Box } from "@liexp/ui/components/mui";
import {
  EventNetworkGraphBox,
  type EventNetworkGraphBoxProps,
} from "@liexp/ui/containers/graphs/EventNetworkGraphBox";
import { type Meta, type Story } from "@storybook/react";
import { subWeeks } from 'date-fns';
import * as React from "react";

const meta: Meta = {
  title: "Containers/Graphs/EventNetworkGraphBox",
  component: EventNetworkGraphBox,
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

const Template: Story<EventNetworkGraphBoxProps> = ({
  query: { ids, ...query },
  ...props
}) => {
  const [items, setItem] = React.useState<any>(
    ids ? ids.map((id) => ({ id })) : []
  );

  const inputProps = {
    style: { width: "100%" },
    selectedItems: items,
    onChange: (items: any[]) => {
      setItem(items);
    },
  };
  const input =
    props.type === KEYWORDS.value ? (
      <AutocompleteKeywordInput {...inputProps} />
    ) : props.type === ACTORS.value ? (
      <AutocompleteActorInput {...inputProps} />
    ) : props.type === GROUPS.value ? (
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
        <Box style={{ display: "flex", flexGrow: 1, maxHeight: 600 }}>
          <EventNetworkGraphBox
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
  startDate: formatDate(subWeeks(new Date(), 10)),
  endDate: formatDate(new Date()),
};

EventsByActors.args = {
  count: 20,
  type: ACTORS.value,
  relations: [ACTORS.value],
  query: {
    ...commonQuery,
    ids: ["4163db78-67ca-4243-80fe-05ff920e70e1"],
  },
  // selectedActorIds: ["1bde0d49-03a1-411d-9f18-2e70a722532b"],
};

const EventsByKeywords = Template.bind({});

EventsByKeywords.args = {
  count: 10,
  type: KEYWORDS.value,
  relations: [GROUPS.value],
  query: {
    ...commonQuery,
    ids: ["fe502631-ef4e-4dfc-a1ff-c2cd04f3ff6d"],
  },
};

const EventsByGroups = Template.bind({});

EventsByGroups.args = {
  count: 10,
  type: GROUPS.value,
  relations: [GROUPS.value],
  query: {
    ...commonQuery,
    ids: ["3879feae-a4f8-4f12-ad8d-3f199050afcd"],
  },
};

const EventsTimelineNetwork = Template.bind({});
EventsTimelineNetwork.args = {
  type: "events",
  relations: [GROUPS.value],
  query: {
    startDate: subWeeks(new Date(), 5).toISOString(),
    endDate: new Date().toISOString(),
  },
};

const OneEventNetwork = Template.bind({});
OneEventNetwork.args = {
  type: "events",
  relations: [GROUPS.value],
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
