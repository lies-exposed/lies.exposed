import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { EntitreeGraph } from "@liexp/ui/lib/components/Common/Graph/Flow/EntitreeGraph/EntitreeGraph.js";
import { AutocompleteActorInput } from "@liexp/ui/lib/components/Input/AutocompleteActorInput.js";
import { ActorFamilyTree } from "@liexp/ui/lib/components/actors/ActorFamilyTree.js";
import { Box } from "@liexp/ui/lib/components/mui/index.js";
import { type Meta, type StoryFn } from "@storybook/react-vite";
import * as React from "react";

const meta: Meta = {
  title: "Containers/Graphs/ActorFamilyTree",
  component: EntitreeGraph,
};

export default meta;

// Sample family tree data: 3 generations with spouses and siblings
const threeGenerationsTree = {
  grandparent: {
    id: "grandparent",
    name: "John Smith",
    fullName: "John Smith",
    avatar: null,
    bornOn: "1940-03-15",
    diedOn: "2010-11-22",
    children: ["parent-1", "parent-2"],
    spouses: ["grandparent-spouse"],
    siblings: [],
  },
  "grandparent-spouse": {
    id: "grandparent-spouse",
    name: "Mary Smith",
    fullName: "Mary Johnson Smith",
    avatar: null,
    bornOn: "1942-07-08",
    diedOn: null,
    children: [],
    spouses: [],
    siblings: [],
    isSpouse: true,
  },
  "parent-1": {
    id: "parent-1",
    name: "James Smith",
    fullName: "James Smith",
    avatar: null,
    bornOn: "1965-01-20",
    diedOn: null,
    children: ["child-1", "child-2"],
    spouses: ["parent-1-spouse"],
    siblings: ["parent-2"],
  },
  "parent-1-spouse": {
    id: "parent-1-spouse",
    name: "Sarah Smith",
    fullName: "Sarah Williams Smith",
    avatar: null,
    bornOn: "1967-09-14",
    diedOn: null,
    children: [],
    spouses: [],
    siblings: [],
    isSpouse: true,
  },
  "parent-2": {
    id: "parent-2",
    name: "Emily Davis",
    fullName: "Emily Smith Davis",
    avatar: null,
    bornOn: "1968-05-03",
    diedOn: null,
    children: ["child-3"],
    spouses: [],
    siblings: ["parent-1"],
    isSibling: true,
  },
  "child-1": {
    id: "child-1",
    name: "Alex Smith",
    fullName: "Alexander Smith",
    avatar: null,
    bornOn: "1990-12-01",
    diedOn: null,
    children: [],
    spouses: [],
    siblings: ["child-2"],
  },
  "child-2": {
    id: "child-2",
    name: "Emma Smith",
    fullName: "Emma Smith",
    avatar: null,
    bornOn: "1993-06-15",
    diedOn: null,
    children: [],
    spouses: [],
    siblings: ["child-1"],
    isSibling: true,
  },
  "child-3": {
    id: "child-3",
    name: "Lucas Davis",
    fullName: "Lucas Davis",
    avatar: null,
    bornOn: "1995-03-22",
    diedOn: null,
    children: [],
    spouses: [],
    siblings: [],
  },
};

const singleCoupleTree = {
  partner1: {
    id: "partner1",
    name: "Alice Brown",
    fullName: "Alice Brown",
    avatar: null,
    bornOn: "1985-04-10",
    diedOn: null,
    children: [],
    spouses: ["partner2"],
    siblings: [],
  },
  partner2: {
    id: "partner2",
    name: "Bob Brown",
    fullName: "Robert Brown",
    avatar: null,
    bornOn: "1983-08-25",
    diedOn: null,
    children: [],
    spouses: [],
    siblings: [],
    isSpouse: true,
  },
};

// Minimal tree showing all edge types
const edgeTypesTree = {
  parent: {
    id: "parent",
    name: "Parent",
    fullName: "Parent Actor",
    avatar: null,
    bornOn: "1960-01-01",
    diedOn: null,
    children: ["child"],
    spouses: ["spouse"],
    siblings: [],
  },
  spouse: {
    id: "spouse",
    name: "Spouse",
    fullName: "Spouse Actor",
    avatar: null,
    bornOn: "1962-01-01",
    diedOn: null,
    children: [],
    spouses: [],
    siblings: [],
    isSpouse: true,
  },
  child: {
    id: "child",
    name: "Child",
    fullName: "Child Actor",
    avatar: null,
    bornOn: "1990-01-01",
    diedOn: null,
    children: [],
    spouses: [],
    siblings: ["sibling"],
  },
  sibling: {
    id: "sibling",
    name: "Sibling",
    fullName: "Sibling Actor",
    avatar: null,
    bornOn: "1992-01-01",
    diedOn: null,
    children: [],
    spouses: [],
    siblings: ["child"],
    isSibling: true,
  },
};

export const ThreeGenerations: StoryFn = () => (
  <Box style={{ height: 600, width: "100%", position: "relative" }}>
    <EntitreeGraph tree={threeGenerationsTree} rootId="grandparent" />
  </Box>
);

export const HorizontalLayout: StoryFn = () => (
  <Box style={{ height: 600, width: "100%", position: "relative" }}>
    <EntitreeGraph tree={threeGenerationsTree} rootId="grandparent" />
  </Box>
);
HorizontalLayout.storyName = "Three Generations (start horizontal via button)";

export const SingleCouple: StoryFn = () => (
  <Box style={{ height: 400, width: "100%", position: "relative" }}>
    <EntitreeGraph tree={singleCoupleTree} rootId="partner1" />
  </Box>
);

export const EdgeTypes: StoryFn = () => (
  <Box style={{ height: 500, width: "100%", position: "relative" }}>
    <EntitreeGraph tree={edgeTypesTree} rootId="parent" />
  </Box>
);
EdgeTypes.storyName = "Edge Types (Parent→Child, Spouse, Sibling)";

export const ConnectedActorFamilyTree: StoryFn = () => {
  const [actorId, setActorId] = React.useState<UUID | undefined>();

  return (
    <Box style={{ height: "100%", width: "100%", position: "absolute" }}>
      <AutocompleteActorInput
        selectedItems={[]}
        discrete={false}
        onChange={(actors) => setActorId(actors[0]?.id as UUID)}
      />
      {actorId && <ActorFamilyTree actorId={actorId} />}
    </Box>
  );
};
ConnectedActorFamilyTree.storyName = "Connected (API-backed)";
