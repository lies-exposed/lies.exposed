import { getSearchEventRelations } from "@liexp/shared/lib/helpers/event/getSearchEventRelations.js";
import { EVENT_TYPES } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { type EventType } from "@liexp/shared/lib/io/http/Events/index.js";
import type * as http from "@liexp/shared/lib/io/http/index.js";
import { getTextContentsCapped } from "@liexp/shared/lib/providers/blocknote/getTextContentsCapped.js";
import { isValidValue } from "@liexp/shared/lib/providers/blocknote/isValidValue.js";
import { isNonEmpty } from "@liexp/shared/lib/utils/array.utils.js";
import { formatDateToShort } from "@liexp/shared/lib/utils/date.utils.js";
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

export interface EventSliderItemBaseProps
  extends Omit<EventListItemProps, "event" | "onRowInvalidate"> {
  type: EventType;
  title: string;
  date: Date;
  excerpt: any;
  url?: string;
  actors: readonly http.Actor.Actor[];
  groups: readonly http.Group.Group[];
  keywords: readonly http.Keyword.Keyword[];
  media: readonly http.Media.Media[];
  links: readonly http.Link.Link[];
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
  ..._props
}) => {
  return (
    <StyledGrid
      className={classes.root}
      size={{ xs: 12, sm: 12, md: 12, lg: 10 }}
      style={{ maxWidth: "100%", width: "100%" }}
    >
      <Grid>
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
          O.fromPredicate(isNonEmpty),
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

      <Grid container spacing={2}>
        {pipe(
          media,
          O.fromPredicate((arr) => arr.length > 0),
          O.map((media) => (
            <Grid size={{ sm: 12, md: 8, lg: 8 }}>
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
          <Grid size={{ sm: 12, md: 4, lg: 4 }}>
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

      <Grid size={{ sm: 12 }}>
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
        O.fromPredicate(isNonEmpty),
        O.fold(
          () => null,
          (ll) => (
            <Grid size={12}>
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
    case EVENT_TYPES.BOOK: {
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
    case EVENT_TYPES.QUOTE: {
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
    case EVENT_TYPES.TRANSACTION: {
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
    case EVENT_TYPES.DOCUMENTARY: {
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
    case EVENT_TYPES.DEATH: {
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
    case EVENT_TYPES.SCIENTIFIC_STUDY: {
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
    case EVENT_TYPES.PATENT: {
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
