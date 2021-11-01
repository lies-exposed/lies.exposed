import { Actor, Events, Group, Keyword } from "@econnessione/shared/io/http";
import { Link } from "@econnessione/shared/io/http/Link";
import { formatDate } from "@econnessione/shared/utils/date";
import { Box, Grid, Typography } from "@material-ui/core";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import { ActorsBox } from "./ActorsBox";
import { MarkdownRenderer } from "./Common/MarkdownRenderer";
import { Slider } from "./Common/Slider/Slider";
import { GroupsBox } from "./GroupsBox";
import { KeywordsBox } from "./KeywordsBox";
import { LinksBox } from "./LinksBox";
import { MainContent } from "./MainContent";
import SEO from "./SEO";

export interface EventPageContentProps {
  event: Events.Uncategorized.Uncategorized;
  onActorClick: (a: Actor.Actor) => void;
  onGroupClick: (a: Group.Group) => void;
  onLinkClick: (a: Link) => void;
  onKeywordClick: (a: Keyword.Keyword) => void;
}

export const EventPageContent: React.FC<EventPageContentProps> = ({
  event,
  onActorClick,
  onGroupClick,
  onKeywordClick,
  onLinkClick,
}) => {
  return (
    <MainContent>
      <Grid container spacing={2}>
        <Grid item md={12} sm={12} xs={12}>
          <SEO title={event.title} />
          <Grid item md={12} style={{ marginBottom: 20 }}>
            {pipe(
              event.images,
              O.fromPredicate((items) => items.length > 0),
              O.map((images) => (
                <Slider
                  key="home-slider"
                  slides={images.map((i) => ({
                    authorName: "",
                    info: i.description,
                    imageURL: i.location,
                  }))}
                  arrows={false}
                  dots={true}
                />
              )),
              O.toNullable
            )}
            <Box>
              <Typography
                variant="h5"
                color="secondary"
                display="inline"
                style={{ marginRight: 10 }}
              >
                {formatDate(event.startDate)}
              </Typography>
              <Typography variant="h3" display="inline">
                {event.title}
              </Typography>
            </Box>
          </Grid>
          <Grid item md={12}>
            <Typography variant="caption">
              {formatDate(event.createdAt)}
            </Typography>
            <KeywordsBox ids={event.keywords} />
          </Grid>
        </Grid>

        <Grid item md={6} sm={6} xs={6}>
          <GroupsBox ids={event.groups} onItemClick={onGroupClick} />
        </Grid>
        <Grid item md={6} sm={6} xs={6}>
          <ActorsBox ids={event.actors} />
        </Grid>
        <Grid item md={12} sm={12} xs={12}>
          <MarkdownRenderer>{event.body}</MarkdownRenderer>
        </Grid>
        <Grid item md={12} sm={12} xs={12}>
          <LinksBox ids={event.links} />
        </Grid>
      </Grid>
    </MainContent>
  );
};
