import { MainContent } from "@liexp/ui/components/MainContent";
import EventSliderModal, {
  EventSliderModalProps,
} from "@liexp/ui/components/Modal/EventSliderModal";
import { Meta, Story } from "@storybook/react/types-6-0";
import * as React from "react";

const meta: Meta<EventSliderModalProps> = {
  title: "Components/Modal/EventSliderModal",
  component: EventSliderModal,
  argTypes: {
    query: {},
  },
};

export default meta;

const Template: Story<EventSliderModalProps> = ({
  query: _query,
  ...props
}) => {
  const [query, setQuery] = React.useState({
    type: undefined,
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

const Example = Template.bind({});

Example.args = {
  query: {
    hash: "event-slider-modal-story",
  },
  onClick: () => {},
};

export { Example as EventSliderModal };
