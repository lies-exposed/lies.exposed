import { type Actor } from "@liexp/shared/lib/io/http/Actor.js";
import * as React from "react";
import { type GetListParams } from "react-admin";
import QueriesRenderer from "../components/QueriesRenderer.js";
import {
  ActorList,
  type ActorListProps,
} from "../components/lists/ActorList.js";
import { useEndpointQueries } from "../hooks/useEndpointQueriesProvider.js";

interface ActorsBoxWrapperProps {
  params: Partial<GetListParams>;
  discrete?: boolean;
  prefix?: string;
  children: (r: { data: Actor[]; total: number }) => React.ReactElement;
}

export const ActorsBoxWrapper: React.FC<ActorsBoxWrapperProps> = ({
  params,
  discrete = true,
  prefix = "actors-wrapper",
  children,
}) => {
  const { Queries } = useEndpointQueries();
  return (
    <QueriesRenderer
      queries={{
        actors: Queries.Actor.list.useQuery(
          { ...params, filter: params.filter ?? null },
          undefined,
          discrete,
          prefix,
        ),
      }}
      render={({ actors }) => children({ ...actors, data: [...actors.data] })}
    />
  );
};

type ActorsBoxProps = Omit<ActorListProps, "actors"> &
  Omit<ActorsBoxWrapperProps, "children">;

const ActorsBox: React.FC<ActorsBoxProps> = ({
  params,
  discrete,
  prefix,
  ...props
}) => {
  return (
    <ActorsBoxWrapper params={params} discrete={discrete} prefix={prefix}>
      {({ data: actors }) => (
        <ActorList
          {...props}
          actors={actors.map((a) => ({ ...a, selected: true }))}
        />
      )}
    </ActorsBoxWrapper>
  );
};

export default ActorsBox;
