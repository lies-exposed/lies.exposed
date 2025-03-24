import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { GetLogger, Logger } from "@liexp/core/lib/logger/Logger.js";
import { HumanReadableStringArb } from "@liexp/test/lib/arbitrary/HumanReadableString.arbitrary.js";
import fc from 'fast-check';
import Docker from "dockerode";
import fs from "fs/promises";
import path from "path";

interface DBTestDockerContainer {
  assertLocalCacheFolder: () => Promise<void>;
  lookup: () => Promise<Docker.Container | undefined>;
  addDatabases: (dbCount: number) => Promise<string[]>;
  waitForDatabase: () => Promise<string>;
  markDatabaseAsUsed: (database: string) => Promise<void>;
  getRunStats: () => Promise<{ used: number }>;
  freeDatabases: () => Promise<void>;
}

const FREE_STATE = "0";
const IN_USE_STATE = "1";

type STATE = typeof FREE_STATE | typeof IN_USE_STATE;

const DATABASES_FILE_PATH = (state?: STATE, db?: string) => {
  const dbPath = state && db ? [`${state}-${db}`] : [];
  return path.join(__dirname, ...["__databases", ...dbPath]);
};

const DATABASE_RUN_COUNT_FILE_PATH = () =>
  path.join(__dirname, "__databases", "run-count");

let container: Docker.Container | undefined;

type GetDockerContainer = (
  logger: Logger,
) => (containerName: string) => DBTestDockerContainer;

const listDatabases = async (): Promise<string[]> => {
  const databases = await fs.readdir(DATABASES_FILE_PATH());
  // console.log("list databases", databases);
  return databases.filter((f) => DATABASE_RUN_COUNT_FILE_PATH() !== f);
};

const readDatabases = async (): Promise<Record<string, boolean>> => {
  const files = await listDatabases();
  let acc: Record<string, boolean> = {};

  return files.reduce((acc, file) => {
    const [state, _db] = file.split("-");
    acc[_db] = state === IN_USE_STATE;
    return acc;
  }, acc);
};

const updateRunCount = async () => {
  const current = await fs.readFile(DATABASE_RUN_COUNT_FILE_PATH(), "utf-8");
  await fs.writeFile(
    DATABASE_RUN_COUNT_FILE_PATH(),
    `${parseInt(current) + 1}`,
  );
};

const getFirstFree = async (logger: Logger): Promise<string | undefined> => {
  const files = await listDatabases();

  const result = files
    .map((file) => file.split("-"))
    .find(([state, _db]) => {
      logger.debug.log("get first free", state, _db);

      return state === FREE_STATE;
    });
  if (result) {
    return result[1];
  }
  return undefined;
};

const waitForDatabase = async (logger: Logger): Promise<string> => {
  const [interval] = fc.sample(fc.integer({ min: 100, max: 200 }), 1);
  return new Promise(async (resolve) => {

    const databaseTimer = setInterval(async () => {
      const freeDatabase = await getFirstFree(logger);

      pipe(
        freeDatabase,
        fp.O.fromNullable,
        fp.O.fold(
          () => {
            logger.debug.log("Waiting for database...");
          },
          (database) => {
            void updateRunCount();

            void Promise.all([
              fs.unlink(DATABASES_FILE_PATH(FREE_STATE, database)).catch(() => {
                console.warn("Error deleting file %s", database);
              }),
              fs.writeFile(DATABASES_FILE_PATH(IN_USE_STATE, database), ""),
            ]).then(() => {
              resolve(database);
              clearInterval(databaseTimer);
            });
          },
        ),
      );
    }, interval);
  });
};

const execCommand = async (
  container: Docker.Container,
  options: Docker.ExecCreateOptions,
) => {
  const exec = await container.exec(options);

  const stream = await exec.start({});

  const resolve = new Promise<string>((resolve, reject) => {
    let output = "";
    stream.on("data", (chunk) => {
      const text = chunk.toString();
      if (text.includes("psql: error")) {
        console.error("Error creating databases: %s", text);
        reject(text);
        return;
      }
      output += text;
    });

    stream.on("end", () => {
      resolve(output);
    });
    stream.on("error", reject);
  });

  return resolve;
};

const safeUnlink = async (state?: STATE, db?: string) => {
  const filePath = DATABASES_FILE_PATH(state, db);
  try {
    await fs.unlink(filePath);
  } catch (e: any) {
    console.warn("Error deleting file %s", filePath);
    if (e.code !== "ENOENT") {
      throw e;
    }
  }
};

const GetDockerContainer: GetDockerContainer = (logger) => (containerName) => {
  const docker = new Docker();

  const lookup = async () => {
    const containers = await docker.listContainers({ all: true });

    logger.debug.log(
      "Look for %s in %O",
      containerName,
      containers.map((c) => c.Names),
    );

    const containerInfo = containers.find((c) =>
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      c.Names.some((n) => n.indexOf(containerName) > 0),
    );

    if (containerInfo) {
      container = docker.getContainer(containerInfo.Id);

      return container;
    }

    throw new Error(`Container ${containerName} not found`);
  };

  const addDatabases = async (dbCount: number): Promise<string[]> => {
    const currentDatabases = await listDatabases();

    logger.debug.log(
      `${currentDatabases.length} databases found, expected ${dbCount}`,
    );

    await fs.writeFile(DATABASE_RUN_COUNT_FILE_PATH(), "0");

    if (currentDatabases.length >= dbCount) {
      const databases = await readDatabases();
      await Promise.all(
        Object.entries(databases).flatMap(async ([db, isUse]) => {
          const promises = [];
          if (isUse) {
            promises.push(safeUnlink(IN_USE_STATE, db));
          }
          promises.push(fs.writeFile(DATABASES_FILE_PATH(FREE_STATE, db), ""));

          return promises;
        }),
      );

      return currentDatabases;
    }

    container = await lookup();

    const databases = fc
      .sample(HumanReadableStringArb(), dbCount)
      .map((s) => s.toLowerCase().replace(/-/g, "_"));

    logger.debug.log("adding databases: %s", databases);
    await execCommand(container, {
      Cmd: [
        "/bin/bash",
        "-h",
        "/docker-entrypoint-initdb.d/psql-create-database.sh",
      ],
      Env: [`DBS=${databases.join(",")}`],
      AttachStdout: true,
      AttachStderr: true,
    });

    await Promise.all(
      databases.map((db) =>
        fs.writeFile(DATABASES_FILE_PATH(FREE_STATE, db), ""),
      ),
    );

    return databases;
  };

  const markDatabaseAsUsed = async (database: string) => {
    await safeUnlink(IN_USE_STATE, database);
    await fs.writeFile(DATABASES_FILE_PATH(FREE_STATE, database), "");
  };

  const freeDatabases = async () => {
    const databases = await readDatabases();

    logger.info.log(
      "Resetting databases %d to free %O",
      Object.keys(databases).length,
    );

    await Promise.all(
      Object.entries(databases).flatMap(([db, state]) => [
        safeUnlink(state ? IN_USE_STATE : FREE_STATE, db),
        fs.writeFile(DATABASES_FILE_PATH(FREE_STATE, db), ""),
      ]),
    );
  };

  const assertLocalCacheFolder = async () => {
    try {
      await fs.readdir(DATABASES_FILE_PATH(), { recursive: true });
    } catch (e: any) {
      if (e.code !== "EEXIST") {
        throw e;
      }
    }
  };

  return {
    lookup,
    addDatabases,
    waitForDatabase: () => waitForDatabase(logger),
    markDatabaseAsUsed,
    freeDatabases,
    assertLocalCacheFolder,
    getRunStats: async () => {
      return {
        used: await fs
          .readFile(DATABASE_RUN_COUNT_FILE_PATH(), "utf-8")
          .then((s) => parseInt(s)),
      };
    },
  };
};

export const testDBContainer = GetDockerContainer(GetLogger("dkr"))(
  "db-test.liexp.dev",
);
