import { type RaRecord } from "react-admin";

export const transformLink = ({ newEvents, ...r }: RaRecord): RaRecord => {
  return {
    ...r,
    image: r.image?.id ? r.image.id : undefined,
    provider: r.provider === "" ? undefined : r.provider,
    events: (r.events ?? []).concat(newEvents ?? []),
  };
};
