import { type SearchEvent } from "@liexp/shared/lib/io/http/Events/index.js";
import {
  type Actor,
  type Group,
  type Keyword,
  type Media,
  type Story,
} from "@liexp/shared/lib/io/http/index.js";
import { isValidValue } from "@liexp/shared/lib/providers/blocknote/isValidValue.js";
import { formatDate } from "@liexp/shared/lib/utils/date.utils.js";
import { parseISO } from "date-fns";
import { Schema } from "effect";
import * as React from "react";
import { useTheme } from "../../theme/index.js";
import { BNEditor } from "../Common/BlockNote/index.js";
import { InlineRelationsPlugin } from "../Common/BlockNote/plugins/renderer/InlineRelationsBoxPlugin.js";
import { TOCPlugin } from "../Common/BlockNote/plugins/renderer/TOCPlugin.js";
import EditButton from "../Common/Button/EditButton.js";
import { MainContent } from "../MainContent.js";
import { Grid, Typography, alpha } from "../mui/index.js";

export interface StoryPageContentProps {
  story: Story.Story;
  onActorClick: (k: Actor.Actor) => void;
  onGroupClick: (k: Group.Group) => void;
  onKeywordClick: (k: Keyword.Keyword) => void;
  onMediaClick: (m: Media.Media) => void;
  onEventClick: (m: SearchEvent.SearchEvent) => void;
}

export const StoryPageContent: React.FC<StoryPageContentProps> = ({
  story: {
    featuredImage,
    actors,
    groups,
    media,
    keywords,
    events,
    links,
    ...story
  },
  onActorClick,
  onGroupClick,
  onKeywordClick,
  onMediaClick,
  onEventClick,
}) => {
  const theme = useTheme();

  const body = story.body2 as any;

  return (
    <Grid container style={{ marginBottom: 100 }}>
      <Grid
        item
        md={12}
        style={{
          backgroundImage: featuredImage
            ? `url(${featuredImage.location})`
            : undefined,
          backgroundSize: `cover`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          width: "100%",
          height: "100%",
          minHeight: 300,
        }}
      >
        <MainContent
          style={{
            paddingTop: 40,
            paddingBottom: 40,
            backgroundColor: `${alpha(theme.palette.common.white, 0.8)}`,
            margin: "30px auto",
          }}
        >
          <Typography variant="h1" style={{ fontSize: "3rem" }}>
            {story.title}
          </Typography>
        </MainContent>
      </Grid>
      <Grid container>
        <Grid item md={3}>
          <TOCPlugin
            value={body}
            onClick={(k) => {
              const header = document.getElementById(k);
              if (header) {
                header.scrollIntoView({ behavior: "smooth" });
              }
            }}
          />
        </Grid>
        <Grid item md={6}>
          <MainContent style={{ marginBottom: 40 }}>
            <div style={{ textAlign: "right", padding: 10 }}>
              <EditButton
                admin={false}
                resourceName="stories"
                resource={story}
              />
            </div>
            <div style={{ marginBottom: 50 }}>
              <Typography className="label" style={{}}>
                {formatDate(
                  Schema.is(Schema.String)(story.createdAt)
                    ? parseISO(story.createdAt)
                    : story.createdAt,
                )}
              </Typography>
            </div>

            {isValidValue(body) ? <BNEditor readOnly content={body} /> : null}
          </MainContent>
        </Grid>
        <Grid item md={3}>
          <InlineRelationsPlugin
            relations={{
              actors,
              groups,
              keywords,
              media,
              links,
              events,
              groupsMembers: [],
              areas: [],
            }}
            onActorClick={onActorClick}
            onGroupClick={onGroupClick}
            onKeywordClick={onKeywordClick}
            onMediaClick={onMediaClick}
            onEventClick={onEventClick}
          />
        </Grid>
      </Grid>
    </Grid>
  );
};
