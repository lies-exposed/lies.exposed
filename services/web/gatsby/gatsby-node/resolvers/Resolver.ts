import { pipe } from "fp-ts/lib/pipeable"

type ResolveFn<T> = (source: any, args: any, context: any) => Promise<T>
export interface Resolver<T> {
  type: string
  resolve?: ResolveFn<T>
}

export interface GetResolverOptions {
  key: string
  many: boolean
  required: boolean
  modifiers?: string[]
}

type GetType = (opts: GetResolverOptions) => string

export type GetResolver<T> = (
  type: GetType
) => (opts: GetResolverOptions) => Resolver<T>

export type GetResolveFn<T> = (
  type: string
) => (opts: GetResolverOptions) => ResolveFn<T>

export const MakeType = <T extends string>(type: T): GetType => (
  opts: GetResolverOptions
) =>
  pipe(
    type,
    (type) => (opts.many ? `[${type}!]` : type),
    (type) => (opts.required ? `${type}!` : type),
    (type) => (opts.modifiers !== undefined ? `${type} ${opts.modifiers.join(' ')}` : type),
  )

export const MakeGetResolver = <T>(f?: GetResolveFn<T>): GetResolver<T> => (
  getType: GetType
) => (opts) => ({
  type: getType(opts),
  resolve: f !== undefined ? f(getType(opts))(opts) : undefined,
})
