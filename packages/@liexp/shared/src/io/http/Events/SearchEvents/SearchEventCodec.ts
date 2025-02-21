import * as t from "io-ts";
import { Keyword } from "../../Keyword.js";
import { Link } from "../../Link.js";
import { Media } from "../../Media/index.js";

// export type SearchEventBase<EventP extends t.Props> = Omit<
//   T,
//   "payload" | "media" | "keywords" | "links"
// > & {
//   media: Media[];
//   keywords: Keyword[];
//   links: Link[];
// };

interface EventProps {
  [key: string]: t.Mixed;
  payload: t.ExactC<t.TypeC<any>>;
}

type SearchEventCodec<
  EventP extends EventProps,
  PayloadP extends t.Props,
> = t.ExactC<
  t.TypeC<
    Omit<EventP, "payload" | "media" | "links" | "keywords"> & {
      payload: t.ExactC<
        t.TypeC<
          Omit<EventP["payload"]["type"]["props"], keyof PayloadP> & PayloadP
        >
      >;
      media: t.ArrayC<typeof Media>;
      keywords: t.ArrayC<typeof Keyword>;
      links: t.ArrayC<typeof Link>;
    }
  >
>;

export const SearchEventCodec = <
  EventP extends EventProps,
  PayloadP extends t.Props,
>(
  eventType: t.ExactC<t.TypeC<EventP>>,
  payloadOverride: PayloadP,
): SearchEventCodec<EventP, PayloadP> => {
  const payloadT: any = eventType.type.props.payload;
  const payloadProps = payloadT.type?.props ?? payloadT.props;
  const codec = t.strict(
    {
      ...eventType.type.props,
      payload: t.strict(
        {
          ...payloadProps,
          ...payloadOverride,
        },
        `SearchEvent${eventType.name}Payload`,
      ),
      media: t.array(Media),
      keywords: t.array(Keyword),
      links: t.array(Link),
    },
    `SearchEvent${eventType.name}`,
  );

  return codec as any;
};
