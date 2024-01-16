import { MainContent } from "@liexp/ui/lib/components/MainContent.js";
import EventSliderModal, {
  type EventSliderModalProps,
} from "@liexp/ui/lib/components/Modal/EventSliderModal.js";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta<EventSliderModalProps> = {
  title: "Components/Modal/EventSliderModal",
  component: EventSliderModal,
  argTypes: {
    query: {},
  },
};

export default meta;

const Template: StoryFn<EventSliderModalProps> = ({
  query: _query,
  ...props
}) => {
  const [query, setQuery] = React.useState({
    eventType: undefined,
    title: undefined,
    actors: [],
    groups: [],
    groupsMembers: [],
    keywords: [],
    media: [],
    links: [],
    locations: undefined,
    startDate: undefined,
    endDate: undefined,
    exclude: undefined,
    withDeleted: undefined,
    withDrafts: undefined,
    draft: undefined,
    _sort: null,
    _order: null,
    ..._query,
  });

  const onQueryChange = (q: any): void => {
    setQuery({ ...query, ...q });
  };

  return (
    <MainContent>
      <EventSliderModal
        open={true}
        {...props}
        query={query}
        onQueryChange={onQueryChange}
        onActorClick={(a) => {
          onQueryChange({
            actors: [a.id],
          });
        }}
        onKeywordClick={(k) => {
          onQueryChange({
            keywords: [k.id],
          });
        }}
      />
    </MainContent>
  );
};

const ExampleSliderModal = Template.bind({});

ExampleSliderModal.args = {
  query: {
    hash: "event-slider-modal-story",
  },
  onClick: () => {},
};

export { ExampleSliderModal };
