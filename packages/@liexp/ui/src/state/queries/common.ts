import * as R from 'fp-ts/Record';

export const emptyQuery = (): Promise<any> =>
  Promise.resolve({
    data: [],
    total: 0,
  });

export const fetchQuery =
  <P, R>(q: (p: P) => Promise<R>) =>
  async ({ queryKey }: any): Promise<R> => {
    const params = queryKey[1];
    const discrete = queryKey[2];
    if (discrete) {
      if (R.isEmpty(params.filter) || !params.filter.ids || params.filter.ids.length === 0) {
        return await emptyQuery();
      }
    }

    return await q(params);
  };
