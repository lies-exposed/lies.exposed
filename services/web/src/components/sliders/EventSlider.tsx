import { ProjectTransactionListItem } from "@components/lists/EventList/ProjectTransactionListItem";
import { ProtestListItem } from "@components/lists/EventList/ProtestListItem";
import { UncategorizedListItem } from "@components/lists/EventList/UncategorizedListItem";
import { Events } from "@econnessione/shared/lib/io/http";
import { Block } from "baseui/block";
import * as React from "react";
import SlickSlider from "react-slick";

export interface EventSliderProps {
  events: Events.Event[];
}

export const EventSlider: React.FC<EventSliderProps> = (props) => {
  return (
    <Block>
      <SlickSlider
        adaptiveHeight={true}
        infinite={false}
        arrows={true}
        draggable={false}
        dots={true}
      >
        {props.events.map((e, index) => {
          if (Events.Uncategorized.Uncategorized.is(e)) {
            return <UncategorizedListItem key={e.id} item={e} actors={[]} groups={[]} topics={[]} />;
          }

          // if (Events.ProjectTransaction.ProjectTransactionMD.is(e)) {
          //   return (
          //     <ProjectTransactionListItem
          //       key={e.frontmatter.id}
          //       index={index}
          //       item={{ ...e.frontmatter, selected: true }}
          //     />
          //   );
          // }

          if (Events.Protest.ProtestMD.is(e)) {
            return <ProtestListItem key={e.frontmatter.id} item={e} />;
          }

          return <div key={e.type}>{e.type}</div>;
        })}
      </SlickSlider>
    </Block>
  );
};
