import { type Task } from 'fp-ts/lib/Task';
import { type RouteContext } from '#routes/route.types';

export type CronFnOpts = (Date | "manual" | "init");
export type CronJobTE = (ctx: RouteContext) => (opts: CronFnOpts) => Task<void>;