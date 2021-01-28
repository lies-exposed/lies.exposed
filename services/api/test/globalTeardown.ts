import * as Docker from 'dockerode'

export default async (): Promise<void> => {
  if (process.env.TEST_MODE === 'local') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dbContainer: Docker.Container = (global as any).__DB_TEST_CONTAINER__
    const storageContainer: Docker.Container = (global as any)
      .__STORAGE_TEST_CONTAINER__

    await dbContainer.stop({ t: 10 })
    await storageContainer.stop({ t: 10 })
  }

  return undefined
}
