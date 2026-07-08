import { Pool } from "pg";

/**
 * Direct Postgres access to the throwaway liexp_test database, for
 * eval-db tests to verify liexp_cli actually persisted data (not just that
 * the tool call happened / the API returned 200) and to clean up rows they
 * created.
 *
 * Reads connection info from process.env, populated by evalDbSetup.ts from
 * the runtime info written by evalDbGlobalSetup.ts.
 */

let pool: Pool | undefined;

const getPool = (): Pool => {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });
  }
  return pool;
};

export const queryDb = async <T extends object>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> => {
  const { rows } = await getPool().query<T>(sql, params);
  return rows;
};

export const closeDb = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
};
