import { ACTORS } from "@liexp/shared/io/http/Actor";
import { GROUPS } from "@liexp/shared/io/http/Group";
import { KEYWORDS } from "@liexp/shared/io/http/Keyword";
import { AutocompleteActorInput } from "@liexp/ui/components/Input/AutocompleteActorInput";
import { AutocompleteGroupInput } from "@liexp/ui/components/Input/AutocompleteGroupInput";
import { AutocompleteKeywordInput } from "@liexp/ui/components/Input/AutocompleteKeywordInput";
import {
  Box
} from "@liexp/ui/components/mui";
import {
  EventNetworkGraphBox,
  EventNetworkGraphBoxProps
} from "@liexp/ui/containers/graphs/EventNetworkGraphBox";
import { Meta, Story } from "@storybook/react/types-6-0";
import * as React from "react";

const meta: Meta = {
  title: "Components/Graph/EventNetworkGraph",
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

const Template: Story<EventNetworkGraphBoxProps> = ({ id, ...props }) => {
  const [item, setItem] = React.useState<any>(id ? { id } : undefined);

  const inputProps = {
    style: { width: "100%" },
    selectedItems: item ? [item] : [],
    onChange: (item: any[]) => {
      setItem(item[0]);
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
          {item ? (
            <EventNetworkGraphBox
              {...props}
              query={{
                ...props.query,
              }}
              id={item.id}
            />
          ) : (
            <span>{"Select a 'groupBy'"}</span>
          )}
        </Box>
      </Box>
    </>
  );
};

const EventsByActors = Template.bind({});

EventsByActors.args = {
  count: 20,
  type: "actors",
  id: "1bde0d49-03a1-411d-9f18-2e70a722532b" as any,
  query: {
    groupBy: "keywords",
  },
  selectedActorIds: ["1bde0d49-03a1-411d-9f18-2e70a722532b"],
};

const EventsByKeywords = Template.bind({});

EventsByKeywords.args = {
  count: 10,
  type: "keywords",
  id: "fe502631-ef4e-4dfc-a1ff-c2cd04f3ff6d" as any,
  query: {
    groupBy: "keywords",
  },
};

const EventsByGroups = Template.bind({});

EventsByGroups.args = {
  count: 10,
  type: GROUPS.value,
  id: "1bde0d49-03a1-411d-9f18-2e70a722532b" as any,
  query: {
    groupBy: KEYWORDS.value,
  },
};

export { EventsByActors, EventsByKeywords, EventsByGroups };
