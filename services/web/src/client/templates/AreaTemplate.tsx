import { AreaPageContent } from "@liexp/ui/components/AreaPageContent";
import { ErrorBox } from "@liexp/ui/components/Common/ErrorBox";
import { Loader } from "@liexp/ui/components/Common/Loader";
import { MainContent } from "@liexp/ui/components/MainContent";
import SEO from "@liexp/ui/components/SEO";
import { Queries } from "@liexp/ui/providers/DataProvider";
import { RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";

export default class AreaTemplate extends React.PureComponent<
  RouteComponentProps<{
    areaId: string;
  }>
> {
  render(): JSX.Element {
    return pipe(
      O.fromNullable(this.props.areaId),
      O.fold(
        () => <div>Missing project id</div>,
        (areaId) => (
          <WithQueries
            queries={{ area: Queries.Area.get }}
            params={{ area: { id: areaId } }}
            render={QR.fold(Loader, ErrorBox, ({ area }) => {
              return (
                <MainContent>
                  <SEO
                    title={area.label}
                    image={""}
                    urlPath={`areas/${area.id}`}
                  />
                  <AreaPageContent
                    {...area}
                    onGroupClick={() => {}}
                    onTopicClick={() => {}}
                  />
                  {/* <EventList events={events} actors={[]} groups={[]} /> */}
                </MainContent>
              );
            })}
          />
        )
      )
    );
  }
}
