import { type Events } from "@liexp/shared/lib/io/http";
import { formatDate } from "@liexp/shared/lib/utils/date";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import * as React from "react";
import { MarkdownRenderer } from "../../Common/MarkdownRenderer";
import { Grid } from "../../mui";
import { MediaSlider } from '../../sliders/MediaSlider';

interface ProtestListItemProps {
  item: Events.Protest.ProtestMD;
}

export const ProtestListItem: React.FC<ProtestListItemProps> = ({ item }) => {
  return (
    <div
      key={item.frontmatter.id}
      id={item.frontmatter.id}
      style={{
        width: '100%'
      }}
    >
      <div>
        <Grid container direction="column" style={{ height: 400 }}>
          {pipe(
            item.frontmatter.media,
            O.map((media) => (
              // eslint-disable-next-line react/jsx-key
              <Grid item>
                <MediaSlider
                  key="home-slider"
                  data={media}
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
