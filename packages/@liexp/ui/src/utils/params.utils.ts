import { type PaginationPayload } from "ra-core";

export const paginationToParams = (
  params: Partial<PaginationPayload> | undefined,
): { _start: `${number}`; _end: `${number}` } => {
  if (!params) return { _start: "0", _end: "0" };

  const page = params?.page ?? 0;
  const perPage = params?.perPage ?? 0;

  return {
    _start: `${page * perPage}`,
    _end: `${page + 1 * perPage}`,
  };
};
