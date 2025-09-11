import EventsBox, {
  type EventsBoxProps,
} from "@liexp/ui/lib/containers/EventsBox.js";
import { type StoryObj, type Meta } from "@storybook/react-vite";

const meta = {
  title: "Containers/Events/EventsBox",
  component: EventsBox,
} satisfies Meta<EventsBoxProps>;

export default meta;

type Story = StoryObj<typeof meta>;

const EventsBoxExample: Story = {
  args: {
    title: "Last updated events",
    query: { _order: "DESC", _sort: "updatedAt" },
    onEventClick() {},
  },
};

export { EventsBoxExample as EventsBox };
