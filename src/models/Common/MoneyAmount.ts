import * as t from 'io-ts'

export const Currency = t.union([t.literal('eur'), t.literal('dollar')], 'Currency');
export type Currency = t.TypeOf<typeof Currency>

export const MoneyAmount = t.strict({
  amount: t.number,
  currency: Currency
}, 'MoneyAmount')
export type MoneyAmount = t.TypeOf<typeof MoneyAmount>
