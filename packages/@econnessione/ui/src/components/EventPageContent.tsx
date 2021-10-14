import { Actor, Events, Group, Keyword } from "@econnessione/shared/io/http";
import { Link } from "@econnessione/shared/io/http/Link";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  Grid,
  List,
  ListItem,
  Typography,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { navigate } from "@reach/router";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import { MarkdownRenderer } from "./Common/MarkdownRenderer";
import { Slider } from "./Common/Slider/Slider";
import { MainContent } from "./MainContent";
import SEO from "./SEO";
import { ActorList } from "./lists/ActorList";
import GroupList from "./lists/GroupList";

export interface EventPageContentProps {
  event: Events.Uncategorized.Uncategorized;
  actors: Actor.Actor[];
  groups: Group.Group[];
  links: Link[];
  keywords: Keyword.Keyword[];
}

export const EventPageContent: React.FC<EventPageContentProps> = ({
  event,
  actors,
  groups,
  links,
  keywords,
}) => {
  return (
    <MainContent>
      <Grid container>
        <Grid item md={12}>
          <SEO title={event.title} />
          <Typography variant="h1">{event.title}</Typography>

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
                arrows={true}
                // adaptiveHeight={true}
                dots={true}
              />
            )),
            O.toNullable
          )}
        </Grid>

        <Grid item md={6}>
          <Typography variant="h4">Groups</Typography>
          {pipe(
            event.groups,
            O.fromPredicate((items) => items.length > 0),
            O.map((ids) => groups.filter((a) => ids.includes(a.id))),
            O.fold(
              () => null,
              (groups) => (
                <GroupList
                  groups={groups.map((a) => ({ ...a, selected: true }))}
                  onGroupClick={async (g) => {
                    await navigate(`/groups/${g.id}`);
                  }}
                />
              )
            )
          )}
        </Grid>
        <Grid item md={6}>
          <Typography variant="h4">Actors</Typography>
          {pipe(
            event.actors,
            O.fromPredicate((items) => items.length > 0),
            O.map((actorIds) => actors.filter((a) => actorIds.includes(a.id))),
            O.fold(
              () => null,
              (actors) => (
                <ActorList
                  actors={actors.map((a) => ({ ...a, selected: true }))}
                  onActorClick={async (a) => {
                    await navigate(`/actors/${a.id}`);
                  }}
                />
              )
            )
          )}
        </Grid>
        <Grid item md={6}>
          <Typography variant="h4">Keywords</Typography>
          {pipe(
            event.keywords,
            O.fromPredicate((items) => items.length > 0),
            O.map((actorIds) =>
              keywords.filter((a) => actorIds.includes(a.id))
            ),
            O.fold(
              () => null,
              (keywords) =>
                keywords.map((a) => (
                  <Chip key={a.id} label={a.tag} variant="outlined" />
                ))
            )
          )}
        </Grid>
        <Grid item md={12}>
          <MarkdownRenderer>{event.body}</MarkdownRenderer>
        </Grid>
        <Grid item md={12}>
          {pipe(
            links,
            O.fromPredicate((arr) => arr.length > 0),
            O.map((links) => (
              // eslint-disable-next-line react/jsx-key
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel2a-content"
                  id={"link-accordion"}
                >
                  <Typography variant="h6">Links</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    {links.map((l, i) => (
                      <ListItem key={i}>
                        <p>
                          <a href={l.url}>
                            {l.description} -{" "}
                            {l.url.substr(0, 30).concat("...")}
                          </a>
                        </p>
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            )),
            O.toNullable
          )}
        </Grid>
      </Grid>
    </MainContent>
  );
};
