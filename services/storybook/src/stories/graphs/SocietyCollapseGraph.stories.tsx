import { SocietyCollapseForecastGraphContainer as SocietyCollapseForecastGraph } from "@liexp/ui/lib/components/Graph/SocietyCollapseForecastGraph/SocietyCollapseForecastGraph.js";
import { type Meta } from "@storybook/react-vite";

const meta: Meta = {
  title: "Components/Graph/SocietyCollapseForecastGraph",
  component: SocietyCollapseForecastGraph,
  parameters: {
    docs: {
      description: {
        component: "Possible climate scenarios with collapse steps.",
      },
    },
  },
} satisfies Meta;

export default meta;

export const SocietyCollapseForecastGraphExample = {
  args: {},
};
