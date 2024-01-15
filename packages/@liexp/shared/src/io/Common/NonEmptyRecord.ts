import * as R from "fp-ts/lib/Record.js";
import * as t from "io-ts";

export interface NonEmptyRecordBrand {
  readonly NonEmptyRecord: unique symbol;
}
export type NonEmptyRecord<P extends t.Props> = t.Branded<
  t.TypeOfProps<P>,
  NonEmptyRecordBrand
>;

export interface NonEmptyRecordC<P extends t.Props>
  extends t.Type<NonEmptyRecord<P>, unknown, unknown> {}

/**
 * A codec that succeeds if a record is not empty
 *
 * @example
 * import { NonEmptyRecord } from 'io-ts-types/lib/NonEmptyRecord'
 * import { right } from 'fp-ts/lib/Either.js'
 * import { PathReporter } from 'io-ts/lib/PathReporter.js'
 *
 * assert.deepStrictEqual(NonEmptyRecord.decode({ key: 1 }), right({ key: 1 }))
 * assert.deepStrictEqual(PathReporter.report(NonEmptyRecord.decode({})), ['Invalid value "{}" supplied to : NonEmptyRecord'])
 *
 * @since 0.4.5
 */
export const NonEmptyRecord = t.brand(
  t.record(t.string, t.unknown),
  (s): s is NonEmptyRecord<Record<string, t.UnknownC>> => !R.isEmpty(s),
  "NonEmptyRecord",
);

export const nonEmptyRecordFromType = <P extends t.Props>(
  rec: P,
  name?: string,
): NonEmptyRecordC<P> =>
  t.brand(
    t.exact(t.partial(rec), name),
    (s): s is NonEmptyRecord<P> => !R.isEmpty(s),
    `NonEmptyRecord`,
  );
