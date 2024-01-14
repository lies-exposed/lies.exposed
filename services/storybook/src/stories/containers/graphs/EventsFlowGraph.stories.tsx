import { AutocompleteActorInput } from "@liexp/ui/lib/components/Input/AutocompleteActorInput.js";
import { AutocompleteGroupInput } from "@liexp/ui/lib/components/Input/AutocompleteGroupInput.js";
import { AutocompleteKeywordInput } from "@liexp/ui/lib/components/Input/AutocompleteKeywordInput.js";
import { Box } from "@liexp/ui/lib/components/mui/index.js";
import {
  EventsFlowGraphBox,
  type EventsFlowGraphBoxProps,
} from "@liexp/ui/lib/containers/graphs/EventsFlowGraphBox.js";
import { type Meta, type StoryFn } from "@storybook/react";
import subYears from "date-fns/subYears/index.js";
import React from "react";

const meta: Meta = {
  title: "Containers/Graphs/EventsFlowGraphBox",
  component: EventsFlowGraphBox,
};

export default meta;

const Template: StoryFn<EventsFlowGraphBoxProps> = ({ type, id, ...props }) => {
  const [item, setActor] = React.useState<any | undefined>(
    id ? { id } : undefined,
  );

  const AutocompleteItemInput = React.useMemo(() => {
    switch (type) {
      case "actors":
        return AutocompleteActorInput;
      case "groups":
        return AutocompleteGroupInput;
      default: {
        return AutocompleteKeywordInput;
      }
    }
  }, [type]);
  return (
    <Box style={{ height: "100%", width: "100%", position: "absolute" }}>
      <AutocompleteItemInput
        selectedItems={item ? [item] : []}
        discrete={false}
        onChange={(actors) => {
          setActor(actors?.[0]);
        }}
      />
      {item ? (
        <EventsFlowGraphBox
          type={type}
          id={item.id}
          query={{
            [type]: [item.id],
            startDate: subYears(new Date(), 5).toISOString(),
            endDate: new Date().toISOString(),
          }}
          onEventClick={() => {}}
        />
      ) : null}
    </Box>
  );
};

const ActorEventsFlowGraphExample = Template.bind({});

ActorEventsFlowGraphExample.args = {
  type: "actors",
};

const GroupEventsFlowGraphExample = Template.bind({});

GroupEventsFlowGraphExample.args = {
  type: "groups",
};

const KeywordEventsFlowGraphExample = Template.bind({});
KeywordEventsFlowGraphExample.args = {
  type: "keywords",
  id: "eb5333a7-87c6-47d0-b259-fc8e95da2c97" as any,
};

export {
  ActorEventsFlowGraphExample,
  GroupEventsFlowGraphExample,
  KeywordEventsFlowGraphExample,
};
