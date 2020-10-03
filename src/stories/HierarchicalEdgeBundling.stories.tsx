import {
  HierarchicalEdgeBundling,
  HierarchicalEdgeBundlingProps,
} from "@components/graph/HierarchicalEdgeBundling"
import { Story, Meta } from "@storybook/react/types-6-0"
import React from "react"

const meta: Meta = {
  title: "Example/HierarchicalEdgeBundling",
  component: HierarchicalEdgeBundling,
}
export default meta

const Template: Story<HierarchicalEdgeBundlingProps> = (args) => (
  <HierarchicalEdgeBundling {...args} />
)

export const ActorsRelations = Template.bind({})
ActorsRelations.args = {
  width: 300,
  graph: {
    nodes: [
      {
        id: "Attore1",
        group: 1,
        targets: ["Attore2", "Attore3"],
      },
      {
        id: "Attore2",
        group: 2,
        targets: [],
      },
      {
        id: "Attore3",
        group: 3,
        targets: [],
      },
      {
        id: "Attore4",
        group: 3,
        targets: ["Attore3"],
      },
    ],
    links: [
      {
        source: "Attore1",
        target: "Attore2",
        value: 2,
      },
      {
        source: "Attore1",
        target: "Attore3",
        value: 10,
      },
      {
        source: "Attore2",
        target: "Attore3",
        value: 3,
      },
      {
        source: "Attore4",
        target: "Attore3",
        value: 1,
      },
    ],
  },
}
