import {
  type Actor,
  type Story,
  type Group,
  type Keyword,
} from "@liexp/shared/lib/io/http";
import { isValidValue } from "@liexp/shared/lib/slate";
import { formatDate } from "@liexp/shared/lib/utils/date";
import { parseISO } from "date-fns";
import * as t from "io-ts";
import * as React from "react";
import { useTheme } from "../../theme";
import EditButton from "../Common/Button/EditButton";
import { LazyEditor as Editor } from "../Common/Editor";
import { EventTimelinePlugin } from "../Common/Editor/plugins/renderer/EventTimelinePlugin";
import { InlineRelationsPlugin } from "../Common/Editor/plugins/renderer/InlineRelationsBoxPlugin";
import { TOCPlugin } from "../Common/Editor/plugins/renderer/TOCPlugin";
import { KeywordsBox } from "../KeywordsBox";
import { MainContent } from "../MainContent";
import { Grid, Typography, alpha } from "../mui";

export interface StoryPageContentProps {
  story: Story.Story;
  onActorClick: (k: Actor.Actor) => void;
  onGroupClick: (k: Group.Group) => void;
  onKeywordClick: (k: Keyword.Keyword) => void;
}

export const StoryPageContent: React.FC<StoryPageContentProps> = ({
  story: { featuredImage, ...story },
  onActorClick,
  onGroupClick,
  onKeywordClick,
}) => {
  const theme = useTheme();

  const body = story.body2 as any;

  return (
    <Grid container>
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
          <KeywordsBox ids={story.keywords} onItemClick={onKeywordClick} />
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
                  t.string.is(story.createdAt)
                    ? parseISO(story.createdAt)
                    : story.createdAt
                )}
              </Typography>
            </div>

            {isValidValue(body) ? (
              <Editor readOnly value={body} />
            ) : null}
          </MainContent>
        </Grid>
        <Grid item md={3}>
          <InlineRelationsPlugin
            value={body}
            onActorClick={onActorClick}
            onGroupClick={onGroupClick}
            onKeywordClick={onKeywordClick}
          />
          <EventTimelinePlugin value={story.body2 as any} />
        </Grid>
      </Grid>
    </Grid>
  );
};
