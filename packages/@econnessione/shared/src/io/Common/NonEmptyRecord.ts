import * as R from 'fp-ts/lib/Record'
import * as t from 'io-ts'

export interface NonEmptyRecordBrand {
  readonly NonEmptyRecord: unique symbol
}
export type NonEmptyRecord<P extends t.Props> = t.Branded<t.TypeOfProps<P>, NonEmptyRecordBrand>

export interface NonEmptyRecordC<P extends t.Props> extends t.Type<NonEmptyRecord<P>,unknown, unknown> {}

/**
 * A codec that succeeds if a record is not empty
 *
 * @example
 * import { NonEmptyRecord } from 'io-ts-types/lib/NonEmptyRecord'
 * import { right } from 'fp-ts/lib/Either'
 * import { PathReporter } from 'io-ts/lib/PathReporter'
 *
 * assert.deepStrictEqual(NonEmptyRecord.decode({ key: 1 }), right({ key: 1 }))
 * assert.deepStrictEqual(PathReporter.report(NonEmptyRecord.decode({})), ['Invalid value "{}" supplied to : NonEmptyRecord'])
 *
 * @since 0.4.5
 */
export const NonEmptyRecord = t.brand(
  t.record(t.string, t.unknown),
  (s): s is NonEmptyRecord<{ [key:string]: t.UnknownC}> => !R.isEmpty(s),
  'NonEmptyRecord'
)

export const nonEmptyRecordFromType = <P extends t.Props>(rec: P): NonEmptyRecordC<P> => t.brand(
  t.exact(t.partial(rec)),
  (s): s is NonEmptyRecord<P> => !R.isEmpty(s),
  `NonEmptyRecord`
)