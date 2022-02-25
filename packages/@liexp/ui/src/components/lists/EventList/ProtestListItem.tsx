import { Events } from "@liexp/shared/io/http";
import { formatDate } from "@liexp/shared/utils/date";
import { Grid } from "@material-ui/core";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { MarkdownRenderer } from "../../Common/MarkdownRenderer";
import { Slider } from "../../Common/Slider/Slider";

interface ProtestListItemProps {
  item: Events.Protest.ProtestMD;
}

export const ProtestListItem: React.FC<ProtestListItemProps> = ({ item }) => {
  return (
    <div
      key={item.frontmatter.id}
      id={item.frontmatter.id}
      style={{
        marginBottom: 40,
      }}
    >
      <div>
        <Grid container direction="column" style={{ height: 400 }}>
          {pipe(
            item.frontmatter.media,
            O.map((media) => (
              // eslint-disable-next-line react/jsx-key
              <Grid item>
                <Slider
                  key="home-slider"
                  slides={media}
                  arrows={true}
                  adaptiveHeight={true}
                  dots={true}
                />
              </Grid>
            )),
            O.toNullable
          )}
          <Grid item>
            <Grid>
              <label>
                <time dateTime={formatDate(item.frontmatter.date)}>
                  {formatDate(item.frontmatter.date)}
                </time>
              </label>

              <div>
                <div>
                  <h4>Di </h4>
                  {/* <GroupOrActorList
                      by={item.frontmatter.organizers.map((g) => ({
                        ...g,
                        selected: false,
                      }))}
                      onByClick={() => {}}
                      avatarScale="scale1000"
                    /> */}
                </div>
                <div>
                  <h4>
                    Per <label>{item.frontmatter.for.type}</label>
                  </h4>
                  <br />
                  {item.frontmatter.for.type === "Project"
                    ? item.frontmatter.for.project.name
                    : null}
                </div>
              </div>
            </Grid>
          </Grid>
          <Grid container>
            <Grid item>
              <MarkdownRenderer>{item.body}</MarkdownRenderer>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};
