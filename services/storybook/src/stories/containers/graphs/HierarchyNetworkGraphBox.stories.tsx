import { ACTORS, type Actor } from "@liexp/io/lib/http/Actor.js";
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
  HierarchyNetworkGraphBox,
  type HierarchyNetworkGraphBoxProps,
} from "@liexp/ui/lib/containers/graphs/HierarchyNetworkGraphBox.js";
import { type Meta, type StoryObj } from "@storybook/react-vite";
import { subWeeks } from "date-fns";
import fc from "fast-check";
import * as React from "react";

const meta = {
  title: "Containers/Graphs/HierarchyNetworkGraphBox",
  component: HierarchyNetworkGraphBox,
} satisfies Meta<HierarchyNetworkGraphBoxProps>;

export default meta;

type Story = StoryObj<typeof meta>;

const seedItems = {
  [KEYWORDS.literals[0]]: fc.sample(KeywordArb, 1),
  [ACTORS.literals[0]]: fc.sample(ActorArb, 1),
  [GROUPS.literals[0]]: fc.sample(GroupArb, 1),
};

const Template = (props: HierarchyNetworkGraphBoxProps): React.ReactElement => {
  const { id, query } = props;

  const input =
    props.type === KEYWORDS.literals[0] ? (
      <KeywordInput />
    ) : props.type === ACTORS.literals[0] ? (
      <ActorInput />
    ) : (
      <GroupInput />
    );

  function KeywordInput(): React.ReactElement {
    const [items, setItems] = React.useState<Keyword[]>(
      seedItems[KEYWORDS.literals[0]],
    );
    return (
      <AutocompleteKeywordInput selectedItems={items} onChange={setItems} />
    );
  }
  function ActorInput(): React.ReactElement {
    const [items, setItems] = React.useState<Actor[]>(
      seedItems[ACTORS.literals[0]],
    );
    return <AutocompleteActorInput selectedItems={items} onChange={setItems} />;
  }
  function GroupInput(): React.ReactElement {
    const [items, setItems] = React.useState<Group[]>(
      seedItems[GROUPS.literals[0]],
    );
    return <AutocompleteGroupInput selectedItems={items} onChange={setItems} />;
  }

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

const commonQuery = {
  startDate: formatDate(subWeeks(new Date(), 10)),
  endDate: formatDate(new Date()),
};

const EventsByActors: Story = {
  render: Template,
  args: {
    count: 20,
    type: ACTORS.literals[0],
    id: "4163db78-67ca-4243-80fe-05ff920e70e1",
    relations: [ACTORS.literals[0]],
    query: {
      ...commonQuery,
    },
  },
};

const EventsByKeywords: Story = {
  render: Template,
  args: {
    count: 10,
    type: KEYWORDS.literals[0],
    relations: [GROUPS.literals[0]],
    query: {
      ...commonQuery,
    },
    id: "fe502631-ef4e-4dfc-a1ff-c2cd04f3ff6d",
  },
};

const EventsByGroups: Story = {
  render: Template,
  args: {
    count: 10,
    type: GROUPS.literals[0],
    id: "3879feae-a4f8-4f12-ad8d-3f199050afcd",
    relations: [GROUPS.literals[0]],
    query: {
      ...commonQuery,
    },
  },
};

export { EventsByActors, EventsByKeywords, EventsByGroups };
