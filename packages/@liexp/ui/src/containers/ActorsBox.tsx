import { type Actor } from "@liexp/shared/lib/io/http/Actor";
import * as React from "react";
import { type GetListParams } from "react-admin";
import QueriesRenderer from "../components/QueriesRenderer";
import { ActorList, type ActorListProps } from "../components/lists/ActorList";
import { useActorsQuery } from "../state/queries/actor.queries";

interface ActorsBoxWrapperProps {
  params: Partial<GetListParams>;
  discrete?: boolean;
  prefix?: string;
  children: (r: { data: Actor[]; total: number }) => JSX.Element;
}

export const ActorsBoxWrapper: React.FC<ActorsBoxWrapperProps> = ({
  params,
  discrete = true,
  prefix = "actors-wrapper",
  children,
}) => {
  return (
    <QueriesRenderer
      queries={{ actors: useActorsQuery(params, discrete, prefix) }}
      render={({ actors }) => children(actors)}
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
