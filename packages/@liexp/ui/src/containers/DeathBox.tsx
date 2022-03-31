import { formatDate } from "@liexp/shared/utils/date";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import QueriesRenderer from "../components/QueriesRenderer";
import { useEventQuery } from "../state/queries/DiscreteQueries";

export class DeathBox extends React.PureComponent<{
  id: string;
}> {
  render(): JSX.Element {
    return pipe(
      O.fromNullable(this.props.id),
      O.fold(
        () => <div>Missing death id</div>,
        (deathId) => (
          <QueriesRenderer
            queries={{ death: useEventQuery({ id: deathId }) }}
            render={({ death }) => {
              return <div>Died on {formatDate(death.date)}</div>;
            }}
          />
        )
      )
    );
  }
}
