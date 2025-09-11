import KeywordDistributionGraph, {
  type KeywordsDistributionGraphProps,
} from "@liexp/ui/lib/components/Graph/KeywordDistributionGraph.js";
import { type StoryObj, type Meta } from "@storybook/react-vite";

const meta = {
  title: "Components/Graph/KeywordDistribution",
  component: KeywordDistributionGraph,
  parameters: {
    docs: {
      description: {
        component: "Display keywords in a distribution graph",
      },
    },
  },
} satisfies Meta<KeywordsDistributionGraphProps>;
export default meta;

type Story = StoryObj<typeof meta>;

export const KeywordDistributionGraphExample = {
  args: {
    onClick: (w) => {
      alert(`${w.tag}: ${w.socialPosts.join(",")}`);
    },
  },
} satisfies Story;
