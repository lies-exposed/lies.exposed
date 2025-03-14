import { Schema } from "effect";
import * as R from "fp-ts/lib/Record.js";

export type NonEmptyRecord<P extends Schema.Struct.Fields> = Schema.Schema<
  { [K in keyof Schema.Struct.Type<P>]: Schema.Struct.Type<P>[K] },
  { [K in keyof Schema.Struct.Encoded<P>]: Schema.Struct.Encoded<P>[K] },
  Schema.Struct.Context<P>
>;

export type NonEmptyRecordC<P extends Schema.Struct.Fields> =
  Schema.Schema.Type<NonEmptyRecord<P>>;

/**
 * A codec that succeeds if a record is not empty
 *
 * @example
 *
 * assert.deepStrictEqual(NonEmptyRecord.decode({ key: 1 }), right({ key: 1 }))
 * assert.deepStrictEqual(PathReporter.report(NonEmptyRecord.decode({})), ['Invalid value "{}" supplied to : NonEmptyRecord'])
 *
 * @since 0.4.5
 */
export const NonEmptyRecord = Schema.Record({
  key: Schema.String,
  value: Schema.Unknown,
})
  .pipe(Schema.filter((s) => !R.isEmpty(s)))
  .pipe(Schema.brand("NonEmptyRecord"))
  .annotations({
    title: "NonEmptyRecord",
  });

export const nonEmptyRecordFromType = <P extends Schema.Struct.Fields>(
  rec: P,
  name?: string,
): NonEmptyRecord<P> =>
  Schema.Struct(rec)
    .pipe(Schema.filter((s) => !R.isEmpty(s)))
    // .pipe(Schema.asSchema);
    .annotations({
      title: `NonEmptyRecord<${name}>`,
    })
