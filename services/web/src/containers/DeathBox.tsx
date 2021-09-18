import { eventMetadataMapEmpty } from "@econnessione/shared/mock-data/events/events-metadata";
import { Queries } from "@econnessione/shared/providers/DataProvider";
import { ActorPageContent } from "@econnessione/ui/components/ActorPageContent";
import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@econnessione/ui/components/Common/FullSizeLoader";
import { MainContent } from "@econnessione/ui/components/MainContent";
import SEO from "@econnessione/ui/components/SEO";
import { EventSlider } from "@econnessione/ui/components/sliders/EventSlider";
import { RouteComponentProps } from "@reach/router";
import { formatDate } from "@utils/date";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React from "react";

export class DeathBox extends React.PureComponent<{
  id: string;
}> {
  render(): JSX.Element {
    return pipe(
      O.fromNullable(this.props.id),
      O.fold(
        () => <div>Missing death id</div>,
        (deathId) => (
          <WithQueries
            queries={{ death: Queries.DeathEvent.get }}
            params={{
              death: { id: deathId },
            }}
            render={QR.fold(LazyFullSizeLoader, ErrorBox, ({ death }) => {
              return <div>Died on {formatDate(death.date)}</div>;
            })}
          />
        )
      )
    );
  }
}
