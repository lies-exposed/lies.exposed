// import * as logger from "@liexp/core/lib/logger/index.js";
// import Docker from "dockerode";

// export type GetDockerContainer = (
//   logger: logger.Logger
// ) => (
//   containerInfo: Docker.ContainerCreateOptions
// ) => Promise<Docker.Container>;

// export const GetDockerContainer: GetDockerContainer = (logger) => async (
//   createContainerOptions
// ) => {
//   let container: Docker.Container | undefined;
//   const docker = new Docker();
//   const containers = await docker.listContainers({ all: true });
//   const oldContainer = containers.find((c) =>
//     // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
//     c.Names.includes(`/${createContainerOptions.name}`)
//   );

//   if (oldContainer !== undefined) {
//     const basicContainerInfo = {
//       containerName: oldContainer.Names,
//       containerId: oldContainer.Id,
//       containerState: oldContainer.State,
//     };

//     logger.debug.log("GetDockerContainer %O", basicContainerInfo);

//     container = docker.getContainer(oldContainer.Id);
//     if (oldContainer.State === "running") {
//       await container.stop({ t: 10 });

//       logger.debug.log("Container stopped");
//     } else if (oldContainer.State === "exited") {
//       logger.debug.log("Removing container...");
//       await container.remove({ v: true });

//       logger.debug.log("Container removed");

//       const volumeNames = createContainerOptions.HostConfig?.Binds?.map(
//         (b) => b.split(":")[0]
//       );

//       if (Array.isArray(volumeNames)) {
//         logger.debug.log("Removing volumes as well...");

//         for (const volumeName of volumeNames) {
//           const volume = docker.getVolume(volumeName);

//           await volume.remove();
//         }
//         logger.debug.log("Volumes removed");
//       }
//       container = undefined;
//     }
//   }

//   if (container === undefined) {
//     logger.debug.log("Container not found, creating it...");

//     container = await docker.createContainer(createContainerOptions);

//     logger.debug.log("Container created");
//   }

//   await container.start();

//   await new Promise((resolve) => setTimeout(resolve, 5000));

//   return container;
// };
