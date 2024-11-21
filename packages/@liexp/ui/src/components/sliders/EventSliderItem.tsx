import { getSearchEventRelations } from "@liexp/shared/lib/helpers/event/getSearchEventRelations.js";
import { type EventType } from "@liexp/shared/lib/io/http/Events/index.js";
import * as http from "@liexp/shared/lib/io/http/index.js";
import { getTextContentsCapped } from "@liexp/shared/lib/providers/blocknote/getTextContentsCapped.js";
import { isValidValue } from "@liexp/shared/lib/providers/blocknote/isValidValue.js";
import { formatDateToShort } from "@liexp/shared/lib/utils/date.utils.js";
import * as A from "fp-ts/lib/Array.js";
import * as O from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { LinksBox } from "../../containers/link/LinksBox.js";
import { styled } from "../../theme/index.js";
import { EventIcon } from "../Common/Icons/index.js";
import { ActorList } from "../lists/ActorList.js";
import { type EventListItemProps } from "../lists/EventList/EventListItem.js";
import GroupList from "../lists/GroupList.js";
import KeywordList from "../lists/KeywordList.js";
import { Box, Grid, Link, Typography } from "../mui/index.js";
import { MediaSlider } from "./MediaSlider.js";

// export interface EventListItemProps {
//   event: Events.SearchEvent.SearchEvent;
//   style?: React.CSSProperties;
//   onClick: (e: any) => void;
//   onActorClick: (a: Actor.Actor) => void;
//   onGroupClick: (g: Group.Group) => void;
//   onGroupMemberClick: (gm: GroupMember.GroupMember) => void;
//   onKeywordClick: (k: Keyword.Keyword) => void;
//   onRowInvalidate: (e: Events.SearchEvent.SearchEvent) => void;
//   onLoad?: () => void;
// }

export interface EventSliderItemBaseProps
  extends Omit<EventListItemProps, "event" | "onRowInvalidate"> {
  type: EventType;
  title: string;
  date: Date;
  excerpt: any;
  url?: string;
  actors: http.Actor.Actor[];
  groups: http.Group.Group[];
  keywords: http.Keyword.Keyword[];
  media: http.Media.Media[];
  links: http.Link.Link[];
}

const EVENT_SLIDER_ITEM_BASE_PREFIX = "event-slider-item-base";
const classes = {
  root: `${EVENT_SLIDER_ITEM_BASE_PREFIX}-root`,
  title: `${EVENT_SLIDER_ITEM_BASE_PREFIX}-title`,
  eventIcon: `${EVENT_SLIDER_ITEM_BASE_PREFIX}-event-icon`,
  mediaSlider: `${EVENT_SLIDER_ITEM_BASE_PREFIX}-media-slider`,
  mediaSliderItem: `${EVENT_SLIDER_ITEM_BASE_PREFIX}-media-slider-item`,
};

const StyledGrid = styled(Grid)(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "column",
    paddingRight: theme.spacing(3),
    paddingLeft: theme.spacing(3),
    width: "100%",
    height: "100%",
  },
  [`& .${classes.title}`]: {
    display: "flex",
    flexDirection: "row",
  },
  [`& .${classes.eventIcon}`]: {
    marginRight: 10,
  },
  [`& .${classes.mediaSlider}`]: {
    width: "100%",
    maxHeight: 400,
    [theme.breakpoints.down("md")]: {
      maxHeight: 200,
    },
  },
  [`& .${classes.mediaSliderItem}`]: {
    maxHeight: 400,
    maxWidth: "100%",
    [theme.breakpoints.down("md")]: {
      maxHeight: 200,
    },
  },
})) as typeof Grid;

export const EventSliderItemBase: React.FC<EventSliderItemBaseProps> = ({
  title,
  type,
  date,
  excerpt,
  url,
  keywords,
  onKeywordClick,
  media,
  links,
  actors,
  onActorClick,
  groups,
  onGroupClick,
  onLoad,
  ...props
}) => {
  return (
    <StyledGrid
      item
      className={classes.root}
      lg={10}
      md={12}
      sm={12}
      xs={12}
      style={{ maxWidth: "100%", width: "100%" }}
    >
      <Grid item>
        <Box className={classes.title}>
          <EventIcon className={classes.eventIcon} type={type} size="2x" />
          <Typography variant="h6" gutterBottom={true}>
            {title}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption">{formatDateToShort(date)}</Typography>
        </Box>
        {pipe(
          keywords,
          O.fromPredicate(A.isNonEmpty),
          O.fold(
            () => null,
            (kk) => (
              <KeywordList
                style={{
                  padding: 0,
                  marginBottom: 20,
                }}
                keywords={kk.map((k) => ({ ...k, selected: true }))}
                onItemClick={(k) => {
                  onKeywordClick?.(k);
                }}
              />
            ),
          ),
        )}

        {url ? (
          <Link
            href={url}
            target="_blank"
            style={{ display: "flex", marginBottom: 20 }}
          >
            {url}
          </Link>
        ) : null}
      </Grid>

      <Grid item container spacing={2}>
        {pipe(
          media,
          O.fromPredicate((arr) => arr.length > 0),
          O.map((media) => (
            // eslint-disable-next-line react/jsx-key
            <Grid item sm={12} md={8} lg={8}>
              <MediaSlider
                className={classes.mediaSlider}
                itemClassName={classes.mediaSliderItem}
                data={media}
                onLoad={onLoad}
                enableDescription={true}
              />
            </Grid>
          )),
          O.toNullable,
        )}
        {isValidValue(excerpt) ? (
          <Grid item sm={12} md={4} lg={4}>
            <Box>
              <Typography
                style={{ display: "flex", marginBottom: 20, flexGrow: 1 }}
                variant="body1"
              >
                {getTextContentsCapped(excerpt, 300)}
              </Typography>
            </Box>
          </Grid>
        ) : null}
      </Grid>

      <Grid item sm={12}>
        <Box sx={{ display: "flex" }}>
          <ActorList
            style={{
              display: "flex",
              flexWrap: "wrap",
              flexDirection: "row",
              width: "50%",
            }}
            actors={actors.map((s) => ({ ...s, selected: true }))}
            onActorClick={onActorClick}
          />
          <GroupList
            style={{
              display: "flex",
              width: "50%",
              flexDirection: "row-reverse",
            }}
            groups={groups.map((s) => ({ ...s, selected: true }))}
            onItemClick={onGroupClick}
          />
        </Box>
      </Grid>
      {pipe(
        links,
        O.fromPredicate(A.isNonEmpty),
        O.fold(
          () => null,
          (ll) => (
            <Grid item lg={12} md={12} sm={12} xs={12}>
              <LinksBox
                filter={{ ids: ll.map((l) => l.id) }}
                column={1}
                onOpen={() => {}}
                onClose={() => {}}
                onItemClick={() => {}}
              />
            </Grid>
          ),
        ),
      )}
    </StyledGrid>
  );
};

type EventSliderItemProps = Omit<
  EventListItemProps,
  "onRowInvalidate" | "onLoad"
>;

const EventSliderItem: React.FC<EventSliderItemProps> = ({
  event: e,
  ...props
}) => {
  const { actors, groups, keywords, links, media } = getSearchEventRelations(e);
  switch (e.type) {
    case http.Events.EventTypes.BOOK.value: {
      return (
        <EventSliderItemBase
          {...props}
          {...e}
          title={e.payload.title}
          date={e.date}
          excerpt={e.excerpt}
          {...{ actors, groups, keywords, links, media }}
        />
      );
    }
    case http.Events.EventTypes.QUOTE.value: {
      return (
        <EventSliderItemBase
          {...props}
          {...e}
          {...{ actors, groups, keywords, links, media }}
          title="Quote"
          links={[]}
        />
      );
    }
    case http.Events.EventTypes.TRANSACTION.value: {
      return (
        <EventSliderItemBase
          {...props}
          date={e.date}
          type={e.type}
          title={e.payload.title}
          excerpt={e.excerpt}
          {...{ actors, groups, keywords, links, media }}
        />
      );
    }
    case http.Events.EventTypes.DOCUMENTARY.value: {
      return (
        <EventSliderItemBase
          {...props}
          type={e.type}
          title={e.payload.title}
          date={e.date}
          excerpt={e.excerpt}
          {...{ actors, groups, keywords, links, media }}
        />
      );
    }
    case http.Events.EventTypes.DEATH.value: {
      return (
        <EventSliderItemBase
          {...props}
          type={e.type}
          title={""}
          date={e.date}
          excerpt={e.excerpt}
          {...{ actors, groups, keywords, links, media }}
        />
      );
    }
    case http.Events.EventTypes.SCIENTIFIC_STUDY.value: {
      return (
        <EventSliderItemBase
          {...props}
          type={e.type}
          title={e.payload.title}
          date={e.date}
          excerpt={e.excerpt}
          {...{ actors, groups, keywords, links, media }}
        />
      );
    }
    case http.Events.EventTypes.PATENT.value: {
      return (
        <EventSliderItemBase
          {...props}
          type={e.type}
          title={e.payload.title}
          date={e.date}
          excerpt={e.excerpt}
          {...{ actors, groups, keywords, links, media }}
        />
      );
    }
    default:
      return (
        <EventSliderItemBase
          {...props}
          type={e.type}
          title={e.payload.title}
          date={e.date}
          excerpt={e.excerpt}
          {...{ actors, groups, keywords, links, media }}
        />
      );
  }
};

export default EventSliderItem;
