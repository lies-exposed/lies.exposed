import { ACTORS } from "@liexp/shared/lib/io/http/Actor.js";
import { GROUPS } from "@liexp/shared/lib/io/http/Group.js";
import { KEYWORDS } from "@liexp/shared/lib/io/http/Keyword.js";
import { formatDate } from "@liexp/shared/lib/utils/date.utils.js";
import { AutocompleteActorInput } from "@liexp/ui/lib/components/Input/AutocompleteActorInput.js";
import { AutocompleteGroupInput } from "@liexp/ui/lib/components/Input/AutocompleteGroupInput.js";
import { AutocompleteKeywordInput } from "@liexp/ui/lib/components/Input/AutocompleteKeywordInput.js";
import { Box } from "@liexp/ui/lib/components/mui/index.js";
import {
  HierarchyNetworkGraphBox,
  type HierarchyNetworkGraphBoxProps,
} from "@liexp/ui/lib/containers/graphs/HierarchyNetworkGraphBox.js";
import { type Meta, type StoryFn } from "@storybook/react-vite";
import { subWeeks } from "date-fns";
import * as React from "react";

const meta: Meta = {
  title: "Containers/Graphs/HierarchyNetworkGraphBox",
  component: HierarchyNetworkGraphBox,
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

const Template: StoryFn<HierarchyNetworkGraphBoxProps> = ({
  id,
  query,
  ...props
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [items, setItem] = React.useState<any[]>([id]);

  const inputProps = {
    style: { width: "100%" },
    selectedItems: items,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onChange: (items: any[]) => {
      setItem(items);
    },
  };
  const input =
    props.type === KEYWORDS.literals[0] ? (
      <AutocompleteKeywordInput {...inputProps} />
    ) : props.type === ACTORS.literals[0] ? (
      <AutocompleteActorInput {...inputProps} />
    ) : (
      <AutocompleteGroupInput {...inputProps} />
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
          <HierarchyNetworkGraphBox {...props} id={id} query={query} />
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
  type: ACTORS.literals[0],
  id: "4163db78-67ca-4243-80fe-05ff920e70e1",
  relations: [ACTORS.literals[0]],
  query: {
    ...commonQuery,
  },
};

const EventsByKeywords = Template.bind({});

EventsByKeywords.args = {
  count: 10,
  type: KEYWORDS.literals[0],
  relations: [GROUPS.literals[0]],
  query: {
    ...commonQuery,
  },
  id: "fe502631-ef4e-4dfc-a1ff-c2cd04f3ff6d",
};

const EventsByGroups = Template.bind({});

EventsByGroups.args = {
  count: 10,
  type: GROUPS.literals[0],
  id: "3879feae-a4f8-4f12-ad8d-3f199050afcd",
  relations: [GROUPS.literals[0]],
  query: {
    ...commonQuery,
  },
};

// const OneHierarchyNetwork = Template.bind({});
// OneHierarchyNetwork.args = {
//   type: "events" as const,
//   relations: [GROUPS.Type],
//   id: "c82575ea-120e-467b-8d75-cbf7e49d721a",
//   query: {
//     ...commonQuery,
//   },
// };

export {
  EventsByActors,
  EventsByKeywords,
  EventsByGroups,
  // OneHierarchyNetwork,
};
