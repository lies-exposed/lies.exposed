import { AreaPageContent } from "@econnessione/ui/components/AreaPageContent";
import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { Loader } from "@econnessione/ui/components/Common/Loader";
import { MainContent } from "@econnessione/ui/components/MainContent";
import SEO from "@econnessione/ui/components/SEO";
import { Queries } from "@econnessione/ui/providers/DataProvider";
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
                  <SEO title={area.label} />
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
