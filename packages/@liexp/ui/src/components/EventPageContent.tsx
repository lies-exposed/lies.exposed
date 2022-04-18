import { getRelationIds } from "@liexp/shared/helpers/event";
import {
  Actor,
  Events,
  Group,
  GroupMember,
  Keyword,
  Media
} from "@liexp/shared/io/http";
import { Death } from "@liexp/shared/io/http/Events";
import { Link } from "@liexp/shared/io/http/Link";
import { formatDateToShort } from "@liexp/shared/utils/date";
import {
  Box,
  Grid,
  Typography,
  useMediaQuery as useMuiMediaQuery,
  useTheme
} from "@material-ui/core";
import * as React from "react";
import ActorsBox from "../containers/ActorsBox";
import { ShareButtons } from "./Common/Button/ShareButtons";
import Editor, { getTextContentsCapped, isValidValue } from "./Common/Editor";
import { GroupMembersBox } from "./GroupMembersBox";
import { GroupsBox } from "./GroupsBox";
import { KeywordsBox } from "./KeywordsBox";
import { LinksBox } from "./LinksBox";
import { MainContent } from "./MainContent";
import SEO from "./SEO";
import { MediaSlider } from "./sliders/MediaSlider";

export interface EventPageContentProps {
  event: Events.Event;
  media: Media.Media[];
  onActorClick: (a: Actor.Actor) => void;
  onGroupClick: (a: Group.Group) => void;
  onGroupMemberClick: (g: GroupMember.GroupMember) => void;
  onLinkClick: (a: Link) => void;
  onKeywordClick: (a: Keyword.Keyword) => void;
}

export const EventPageContent: React.FC<EventPageContentProps> = ({
  event,
  media,
  onActorClick,
  onGroupClick,
  onGroupMemberClick,
  onKeywordClick,
  onLinkClick,
}) => {
  const title =
    (event.payload as any).title ??
    (event.type === Death.DEATH.value
      ? `Death: ${(event.payload as any).victim}`
      : "");
  const theme = useTheme();
  const { actors, groups, groupsMembers } = getRelationIds(event);

  const isDownSM = useMuiMediaQuery(theme.breakpoints.down("sm"));

  const seoImage =
    media[0]?.thumbnail ??
    media[0]?.location ??
    `${process.env.PUBLIC_URL}/liexp-logo.png`;

  const date =
    typeof event.date === "string" ? new Date(event.date) : event.date;
  return (
    <MainContent>
      <SEO
        title={title}
        description={getTextContentsCapped(event.excerpt as any, 230)}
        image={seoImage}
        urlPath={`/events/${event.id}`}
      />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Grid container alignItems="flex-start">
            <Grid
              item
              md={2}
              sm={12}
              style={{
                display: "flex",
                flexDirection: isDownSM ? "row" : "column",
                alignItems: isDownSM ? "center" : "flex-end",
                justifyContent: isDownSM ? "flex-start" : "flex-end",
                paddingRight: 20,
              }}
            >
              <Box
                style={{
                  display: "flex",
                  flexDirection: isDownSM ? "row" : "column",
                }}
              >
                {formatDateToShort(date)
                  .split(" ")
                  .map((chunk, k) => (
                    <Typography
                      key={k}
                      variant="h6"
                      color="primary"
                      style={{ marginBottom: 0 }}
                    >
                      {chunk}
                    </Typography>
                  ))}
              </Box>

              <GroupsBox
                ids={groups}
                style={{
                  display: "flex",
                  flexDirection: isDownSM ? "row" : "row-reverse",
                }}
                onItemClick={onGroupClick}
              />

              <ActorsBox
                params={{
                  filter: { ids: actors },
                  pagination: { perPage: actors.length, page: 1 },
                  sort: { field: "createdAt", order: "DESC" },
                }}
                style={{
                  display: "flex",
                  flexDirection: isDownSM ? "row" : "row-reverse",
                }}
                onItemClick={onActorClick}
              />

              <GroupMembersBox
                ids={groupsMembers}
                style={{
                  display: "flex",
                  flexDirection: isDownSM ? "row" : "row-reverse",
                }}
                onItemClick={onGroupMemberClick}
              />
            </Grid>

            <Grid item md={10} style={{ alignItems: "flex-start" }}>
              <Typography variant="h3">{title}</Typography>
              <Box>
                <KeywordsBox ids={event.keywords} />
                <ShareButtons
                  urlPath={`/events/${event.id}`}
                  title={title}
                  message={getTextContentsCapped(event.excerpt as any, 100)}
                  keywords={[]}
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                  }}
                />
              </Box>

              {isValidValue(event.excerpt) ? (
                <Editor value={event.excerpt} readOnly={true} />
              ) : null}
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container>
            <Grid item md={2} xs={false} />
            <Grid
              item
              lg={10}
              md={10}
              xs={12}
              style={{
                alignContent: "flex-start",
                marginBottom: theme.spacing(5),
              }}
            >
              {media.length > 0 ? (
                <MediaSlider
                  data={media}
                  onClick={() => {}}
                  itemStyle={{
                    height: 400,
                    maxWidth: 800,
                    maxHeight: 500,
                    margin: "auto",
                  }}
                />
              ) : null}
            </Grid>
          </Grid>
          <Grid container>
            {isValidValue(event.body) ? (
              <Grid item md={12} sm={12} xs={12}>
                <Editor value={event.body} readOnly={true} />
              </Grid>
            ) : null}
            <Grid item md={2} />
            <Grid item md={10} sm={12} xs={12}>
              <LinksBox ids={event.links} defaultExpanded={true} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </MainContent>
  );
};
