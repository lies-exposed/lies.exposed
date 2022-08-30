import * as t from 'io-ts';

export const StatsType = t.union([t.literal("keywords"), t.literal("actors"), t.literal('groups')], 'StatsType');
export type StatsType = t.TypeOf<typeof StatsType>